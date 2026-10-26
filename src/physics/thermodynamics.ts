import type {
  CyclePoint,
  EngineParameters,
  OttoStatePoints,
  ThermodynamicResults,
} from '../types/engine';
import { R_AIR } from './constants';
import {
  calculateEngineGeometryDerived,
  computeKinematics,
  getNominalStroke,
  normalizeAngle,
} from './kinematics';

/**
 * Tính toán chu trình Otto lý tưởng
 */
export function calculateOttoCycle(params: EngineParameters): ThermodynamicResults {
  const { displacedVolumeCm3: Vs, clearanceVolumeCm3: Vc } =
    calculateEngineGeometryDerived(params.geometry);
  const cr = params.geometry.compressionRatio;
  const gamma = params.thermo.gamma;
  const p1 = params.thermo.intakePressure; // bar
  const T1 = params.thermo.intakeTemp; // K
  const qIn = params.thermo.heatInput; // kJ/kg

  // Điểm 1: Cuối nạp / Đầu nén (ở ĐCD)
  const v1 = Vc + Vs; // cm3
  const v1_m3 = v1 * 1e-6;
  const p1_Pa = p1 * 1e5;

  // Khối lượng không khí trong xi lanh
  const massAirKg = (p1_Pa * v1_m3) / (R_AIR * T1);

  // Điểm 2: Cuối nén đoạn nhiệt (ở ĐCT)
  const v2 = Vc; // cm3
  const p2 = p1 * Math.pow(cr, gamma); // bar
  const T2 = T1 * Math.pow(cr, gamma - 1); // K

  // Điểm 3: Cuối cấp nhiệt đẳng tích (ở ĐCT)
  const v3 = Vc; // cm3
  const cv = R_AIR / (gamma - 1); // J / (kg * K)
  const deltaT = (qIn * 1000) / cv; // K
  const T3 = T2 + deltaT;
  const p3 = p2 * (T3 / T2); // bar

  // Điểm 4: Cuối giãn nở đoạn nhiệt (ở ĐCD)
  const v4 = v1; // cm3
  const p4 = p3 * Math.pow(1 / cr, gamma); // bar
  const T4 = T3 * Math.pow(1 / cr, gamma - 1); // K

  // Hiệu suất nhiệt lý tưởng Otto: η = 1 - 1 / ε^(γ-1)
  const ottoEfficiencyPercent = (1 - 1 / Math.pow(cr, gamma - 1)) * 100;

  // Công lý tưởng của chu trình (J)
  const netWorkJoules = massAirKg * qIn * 1000 * (ottoEfficiencyPercent / 100);

  const ottoPoints: OttoStatePoints = {
    p1, v1, t1: T1,
    p2, v2, t2: T2,
    p3, v3, t3: T3,
    p4, v4, t4: T4,
  };

  // Tạo mảng 721 điểm (0 đến 720 độ)
  const cyclePoints: CyclePoint[] = [];

  for (let deg = 0; deg <= 720; deg++) {
    const kine = computeKinematics(deg, params);
    const V = kine.cylinderVolume; // cm3
    let p = p1;
    let T = T1;

    if (deg >= 0 && deg < 180) {
      // Kỳ nạp: p = p1
      p = p1;
      T = T1;
    } else if (deg >= 180 && deg < 360) {
      // Kỳ nén đoạn nhiệt: p * V^gamma = const = p1 * v1^gamma
      p = p1 * Math.pow(v1 / V, gamma);
      T = T1 * Math.pow(v1 / V, gamma - 1);
    } else if (deg >= 360 && deg < 540) {
      // Kỳ giãn nở đoạn nhiệt: p * V^gamma = const = p3 * v3^gamma
      p = p3 * Math.pow(v3 / V, gamma);
      T = T3 * Math.pow(v3 / V, gamma - 1);
    } else {
      // Kỳ thải: p = p1
      p = p1;
      T = T1;
    }

    cyclePoints.push({
      theta: deg,
      volume: V,
      pressure: p,
      temp: T,
      stroke: getNominalStroke(deg),
    });
  }

  // Áp suất chỉ thị trung bình IMEP (bar) = W / Vs
  const vs_m3 = Vs * 1e-6;
  const imepBar = (netWorkJoules / vs_m3) * 1e-5;

  // Công suất chỉ thị Pi = W * N / 120 (W) -> kW (động cơ 4 kỳ 1 xi lanh)
  const indicatedPowerKw = (netWorkJoules * params.thermo.rpm) / (120 * 1000);

  return {
    modelType: 'otto',
    cyclePoints,
    currentPressure: p1,
    currentVolume: v1,
    currentTemp: T1,
    maxPressure: p3,
    minPressure: p1,
    grossWork: netWorkJoules,
    pumpingWork: 0,
    netWork: netWorkJoules,
    imep: imepBar,
    indicatedPower: indicatedPowerKw,
    thermalEfficiency: ottoEfficiencyPercent,
    ottoEfficiency: ottoEfficiencyPercent,
    ottoPoints,
  };
}

/**
 * Hàm cháy Wiebe tính phần trăm nhiên liệu đã cháy (Mass Fraction Burned)
 */
function wiebeFraction(theta: number, startAngle: number, duration: number): number {
  if (theta <= startAngle) return 0;
  if (theta >= startAngle + duration) return 1;
  const fraction = (theta - startAngle) / duration;
  return 1 - Math.exp(-5.0 * Math.pow(fraction, 3.0));
}

/**
 * Tính toán chu trình 4 kỳ gần thực tế (Realistic 4-stroke cycle)
 */
export function calculateRealisticCycle(params: EngineParameters): ThermodynamicResults {
  const { displacedVolumeCm3: Vs, clearanceVolumeCm3: Vc } =
    calculateEngineGeometryDerived(params.geometry);
  const cr = params.geometry.compressionRatio;
  const gamma = params.thermo.gamma;
  const rpm = params.thermo.rpm;

  // Tổn thất lưu lượng qua họng nạp/thải
  const rpmFactor = Math.pow(rpm / 6000, 1.8);
  const deltaPIn = 0.02 + 0.08 * rpmFactor; // bar tụt áp nạp
  const deltaPEx = 0.02 + 0.07 * rpmFactor; // bar tăng áp thải

  const pIntakeBar = Math.max(0.2, params.thermo.intakePressure - deltaPIn);
  const pExhaustBar = params.thermo.exhaustPressure + deltaPEx;

  // Số mũ đa biến
  const nCompress = Math.max(1.2, gamma - 0.04);
  const nExpand = Math.max(1.2, gamma - 0.05);

  const Vmax = Vc + Vs;
  const T1 = params.thermo.intakeTemp;

  const ivcAngle = 180 + params.valves.intakeLag;
  const evoAngle = 540 - params.valves.exhaustAdvance;
  const sparkAngle = 360 - params.ignition.sparkAdvance;
  const burnDuration = params.ignition.burnDuration;

  const pCompTDC = pIntakeBar * Math.pow(cr, nCompress);
  const heatPressRiseFactor = (params.thermo.heatInput / 1000) * (cr / 9.5) * 1.8;
  const maxPressureTheoretical = pCompTDC + heatPressRiseFactor * 14;

  const cyclePoints: CyclePoint[] = [];

  for (let deg = 0; deg <= 720; deg++) {
    const kine = computeKinematics(deg, params);
    const V = kine.cylinderVolume;
    let p = pIntakeBar;
    let T = T1;

    if (deg < 180) {
      if (deg < params.valves.exhaustLag) {
        const t = deg / Math.max(params.valves.exhaustLag, 1);
        p = pExhaustBar * (1 - t) + pIntakeBar * t;
      } else {
        p = pIntakeBar;
      }
      T = T1;
    } else if (deg < 360) {
      if (deg < ivcAngle) {
        const prog = (deg - 180) / Math.max(ivcAngle - 180, 1);
        p = pIntakeBar * (1 + 0.15 * prog);
        T = T1 * (1 + 0.05 * prog);
      } else {
        const Vivc = computeKinematics(ivcAngle, params).cylinderVolume;
        const pAtIVC = pIntakeBar * 1.15;
        p = pAtIVC * Math.pow(Vivc / V, nCompress);
        T = T1 * Math.pow(Vivc / V, nCompress - 1);
      }

      if (deg >= sparkAngle) {
        const xb = wiebeFraction(deg, sparkAngle, burnDuration);
        p += xb * (maxPressureTheoretical - pCompTDC) * 0.9;
        T += xb * 1400;
      }
    } else if (deg < 540) {
      const xb = wiebeFraction(deg, sparkAngle, burnDuration);
      const pExpBase = maxPressureTheoretical * Math.pow(Vc / V, nExpand);

      if (deg < sparkAngle + burnDuration) {
        const pCurrentBurn = pCompTDC * Math.pow(Vc / V, nExpand) + xb * (maxPressureTheoretical - pCompTDC);
        p = Math.min(pCurrentBurn, maxPressureTheoretical * 1.05);
      } else {
        p = pExpBase;
      }
      T = (T1 + 1400 * xb) * Math.pow(Vc / V, nExpand - 1);

      if (deg >= evoAngle) {
        const blowdownProgress = (deg - evoAngle) / Math.max(540 - evoAngle, 1);
        const smoothT = Math.pow(blowdownProgress, 1.4);
        p = p * (1 - smoothT) + pExhaustBar * smoothT;
      }
    } else {
      p = pExhaustBar;
      T = T1 + 250;
    }

    cyclePoints.push({
      theta: deg,
      volume: V,
      pressure: Math.max(0.1, p),
      temp: Math.max(250, T),
      stroke: getNominalStroke(deg),
    });
  }

  let grossWorkJoules = 0;
  let pumpingWorkJoules = 0;
  let netWorkJoules = 0;

  for (let i = 0; i < cyclePoints.length - 1; i++) {
    const pt1 = cyclePoints[i];
    const pt2 = cyclePoints[i + 1];

    const dV_m3 = (pt2.volume - pt1.volume) * 1e-6; // m3
    const pAvg_Pa = ((pt1.pressure + pt2.pressure) / 2) * 1e5; // Pa
    const dW = pAvg_Pa * dV_m3; // J

    netWorkJoules += dW;

    if (pt1.theta >= 180 && pt1.theta < 540) {
      grossWorkJoules += dW;
    } else {
      pumpingWorkJoules += dW;
    }
  }

  let maxP = 0;
  let minP = 999;
  for (const pt of cyclePoints) {
    if (pt.pressure > maxP) maxP = pt.pressure;
    if (pt.pressure < minP) minP = pt.pressure;
  }

  const vs_m3 = Vs * 1e-6;
  const imepBar = (netWorkJoules / vs_m3) * 1e-5;
  const indicatedPowerKw = (netWorkJoules * rpm) / (120 * 1000);

  const massAirKg = (pIntakeBar * 1e5 * Vmax * 1e-6) / (R_AIR * T1);
  const totalHeatInJoules = massAirKg * params.thermo.heatInput * 1000;
  const thermalEfficiencyPercent =
    totalHeatInJoules > 0
      ? Math.min(Math.max((netWorkJoules / totalHeatInJoules) * 100, 10), 60)
      : 30;

  const ottoEfficiencyPercent = (1 - 1 / Math.pow(cr, gamma - 1)) * 100;

  return {
    modelType: 'realistic',
    cyclePoints,
    currentPressure: cyclePoints[0].pressure,
    currentVolume: cyclePoints[0].volume,
    currentTemp: cyclePoints[0].temp,
    maxPressure: maxP,
    minPressure: minP,
    grossWork: grossWorkJoules,
    pumpingWork: pumpingWorkJoules,
    netWork: netWorkJoules,
    imep: imepBar,
    indicatedPower: indicatedPowerKw,
    thermalEfficiency: thermalEfficiencyPercent,
    ottoEfficiency: ottoEfficiencyPercent,
  };
}

/**
 * Lấy kết quả nhiệt động học tổng hợp theo chế độ mô hình đã chọn
 */
export function getThermodynamicResults(
  params: EngineParameters,
  modelType: 'otto' | 'realistic',
  currentTheta: number
): ThermodynamicResults {
  const normTheta = Math.round(normalizeAngle(currentTheta));
  const base =
    modelType === 'otto'
      ? calculateOttoCycle(params)
      : calculateRealisticCycle(params);

  const currentPt = base.cyclePoints[normTheta] || base.cyclePoints[0];

  return {
    ...base,
    currentPressure: currentPt.pressure,
    currentVolume: currentPt.volume,
    currentTemp: currentPt.temp,
  };
}
