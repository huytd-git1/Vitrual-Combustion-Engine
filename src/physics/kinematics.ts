import type {
  EngineGeometry,
  EngineKinematicsState,
  EngineParameters,
  StrokeType,
  ValveState,
} from '../types/engine';
import { MAX_VALVE_LIFT_MM, STROKES_CONFIG } from './constants';

/**
 * Chuẩn hóa góc về khoảng [0, 720) độ
 */
export function normalizeAngle(angle: number): number {
  let a = angle % 720;
  if (a < 0) a += 720;
  return a;
}

/**
 * Xác định kỳ danh nghĩa dựa vào góc trục khuỷu
 */
export function getNominalStroke(theta: number): StrokeType {
  const norm = normalizeAngle(theta);
  if (norm < 180) return 'intake';
  if (norm < 360) return 'compression';
  if (norm < 540) return 'combustion';
  return 'exhaust';
}

/**
 * Tính toán hình học cơ bản của động cơ
 */
export function calculateEngineGeometryDerived(geo: EngineGeometry) {
  const r = geo.stroke / 2; // Bán kính khuỷu (mm)
  // Ràng buộc an toàn: chiều dài thanh truyền phải lớn hơn bán kính khuỷu
  const safeL = Math.max(geo.conrodLength, r * 1.05);

  // Diện tích piston A = π * D^2 / 4 (mm2) -> chuyển sang cm2
  const areaMm2 = (Math.PI * geo.bore * geo.bore) / 4;
  const areaCm2 = areaMm2 / 100;

  // Dung tích công tác Vs = A * S (cm3)
  const displacedVolumeCm3 = (areaMm2 * geo.stroke) / 1000;

  // Thể tích buồng cháy Vc = Vs / (ε - 1) (cm3)
  const safeCr = Math.max(geo.compressionRatio, 1.1);
  const clearanceVolumeCm3 = displacedVolumeCm3 / (safeCr - 1);

  return {
    crankRadius: r,
    safeConrodLength: safeL,
    pistonAreaCm2: areaCm2,
    pistonAreaMm2: areaMm2,
    displacedVolumeCm3,
    clearanceVolumeCm3,
  };
}

/**
 * Tính độ nâng xupáp nạp theo góc trục khuỷu
 * α: góc mở sớm trước ĐCT (độ)
 * β: góc đóng muộn sau ĐCD (độ)
 */
export function calculateIntakeValveState(thetaNorm: number, alpha: number, beta: number): ValveState {
  const openAngle = 720 - alpha; // Điểm mở trước ĐCT
  const closeAngle = 180 + beta; // Điểm đóng sau ĐCD
  const totalDuration = 180 + alpha + beta; // Tổng góc mở (độ)

  if (totalDuration <= 0) {
    return { isOpen: false, lift: 0, liftMm: 0 };
  }

  let isOpen = false;
  let elapsed = 0;

  // Khoảng mở vắt qua mốc 0°/720°: [720 - alpha, 720] hợp [0, 180 + beta]
  if (thetaNorm >= openAngle) {
    isOpen = true;
    elapsed = thetaNorm - openAngle;
  } else if (thetaNorm <= closeAngle) {
    isOpen = true;
    elapsed = alpha + thetaNorm;
  }

  if (!isOpen || elapsed < 0 || elapsed > totalDuration) {
    return { isOpen: false, lift: 0, liftMm: 0 };
  }

  // Quy chuẩn về [0, 1] và áp dụng profile cosine êm ái
  const u = Math.min(Math.max(elapsed / totalDuration, 0), 1);
  const lift = 0.5 * (1 - Math.cos(2 * Math.PI * u));
  const liftMm = lift * MAX_VALVE_LIFT_MM;

  return { isOpen: lift > 0.001, lift, liftMm };
}

/**
 * Tính độ nâng xupáp thải theo góc trục khuỷu
 * γe: góc mở sớm trước ĐCD (độ)
 * δ: góc đóng muộn sau ĐCT (độ)
 */
export function calculateExhaustValveState(thetaNorm: number, gammaE: number, delta: number): ValveState {
  const openAngle = 540 - gammaE; // Điểm mở trước ĐCD kỳ cháy
  const closeAngle = delta; // Điểm đóng sau ĐCT chu trình mới
  const totalDuration = 180 + gammaE + delta; // Tổng góc mở

  if (totalDuration <= 0) {
    return { isOpen: false, lift: 0, liftMm: 0 };
  }

  let isOpen = false;
  let elapsed = 0;

  // Khoảng mở vắt qua mốc 0°/720°: [540 - gammaE, 720] hợp [0, delta]
  if (thetaNorm >= openAngle) {
    isOpen = true;
    elapsed = thetaNorm - openAngle;
  } else if (thetaNorm <= closeAngle) {
    isOpen = true;
    elapsed = (720 - openAngle) + thetaNorm;
  }

  if (!isOpen || elapsed < 0 || elapsed > totalDuration) {
    return { isOpen: false, lift: 0, liftMm: 0 };
  }

  const u = Math.min(Math.max(elapsed / totalDuration, 0), 1);
  const lift = 0.5 * (1 - Math.cos(2 * Math.PI * u));
  const liftMm = lift * MAX_VALVE_LIFT_MM;

  return { isOpen: lift > 0.001, lift, liftMm };
}

/**
 * Tính toán trạng thái động học đầy đủ tại một góc trục khuỷu θ
 */
export function computeKinematics(theta: number, params: EngineParameters): EngineKinematicsState {
  const thetaNorm = normalizeAngle(theta);
  const thetaRad = (thetaNorm * Math.PI) / 180;

  const {
    crankRadius: r,
    safeConrodLength: L,
    pistonAreaCm2: A,
    pistonAreaMm2,
    displacedVolumeCm3: Vs,
    clearanceVolumeCm3: Vc,
  } = calculateEngineGeometryDerived(params.geometry);

  // x(θ) = r(1 − cosθ) + L − √(L² − r²sin²θ)
  const sinTheta = Math.sin(thetaRad);
  const cosTheta = Math.cos(thetaRad);
  const termInsideSqrt = Math.max(0, L * L - r * r * sinTheta * sinTheta);
  const pistonDisplacement = r * (1 - cosTheta) + L - Math.sqrt(termInsideSqrt); // mm

  const S = params.geometry.stroke;
  const pistonDisplacementRatio = Math.min(Math.max(pistonDisplacement / S, 0), 1);

  // V(θ) = Vc + A * x(θ)
  const cylinderVolume = Vc + (pistonAreaMm2 * pistonDisplacement) / 1000; // cm3

  // Góc nghiêng thanh truyền φ: sin(φ) = (r / L) * sin(θ)
  const sinPhi = (r / L) * sinTheta;
  const conrodAngleRad = Math.asin(Math.min(Math.max(sinPhi, -1), 1));

  // Trạng thái xupáp
  const intakeValve = calculateIntakeValveState(
    thetaNorm,
    params.valves.intakeAdvance,
    params.valves.intakeLag
  );
  const exhaustValve = calculateExhaustValveState(
    thetaNorm,
    params.valves.exhaustAdvance,
    params.valves.exhaustLag
  );

  // Tia lửa điện: bật trong khoảng [360 - sparkAdvance, 360 - sparkAdvance + 12]
  const sparkStart = 360 - params.ignition.sparkAdvance;
  const sparkEnd = sparkStart + 12;
  const isSparkActive = thetaNorm >= sparkStart && thetaNorm <= sparkEnd;

  // Xác định kỳ danh nghĩa
  const strokeType = getNominalStroke(thetaNorm);
  const strokeName = STROKES_CONFIG[strokeType].name;

  // Tọa độ chốt khuỷu
  const crankPinX = r * Math.sin(thetaRad);
  const crankPinY = -r * Math.cos(thetaRad);
  const pistonPinY = crankPinY - Math.sqrt(termInsideSqrt);

  return {
    theta: thetaNorm,
    thetaRad,
    crankRadius: r,
    safeConrodLength: L,
    pistonArea: A,
    displacedVolume: Vs,
    clearanceVolume: Vc,
    pistonDisplacement,
    pistonDisplacementRatio,
    cylinderVolume,
    strokeType,
    strokeName,
    intakeValve,
    exhaustValve,
    isSparkActive,
    conrodAngleRad,
    pistonY: pistonPinY,
    crankPinX,
    crankPinY,
  };
}
