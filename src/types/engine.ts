export interface EngineGeometry {
  bore: number; // D (mm) [50 - 120]
  stroke: number; // S (mm) [40 - 120]
  conrodLength: number; // L (mm) [80 - 250]
  compressionRatio: number; // ε [6 - 14]
}

export interface EngineThermodynamics {
  rpm: number; // N (vòng/phút) [300 - 6000]
  intakePressure: number; // p_in (bar) [0.5 - 1.2]
  exhaustPressure: number; // p_ex (bar) [0.9 - 1.5]
  intakeTemp: number; // T_in (K) [280 - 350]
  gamma: number; // γ hệ số nhiệt dung [1.25 - 1.40]
  heatInput: number; // q_in (kJ/kg) [500 - 2000]
}

export interface ValveTiming {
  intakeAdvance: number; // α (độ trước ĐCT) [0 - 40]
  intakeLag: number; // β (độ sau ĐCD) [0 - 80]
  exhaustAdvance: number; // γe (độ trước ĐCD) [0 - 80]
  exhaustLag: number; // δ (độ sau ĐCT) [0 - 40]
}

export interface IgnitionConfig {
  sparkAdvance: number; // độ trước ĐCT cuối kỳ nén [0 - 40]
  burnDuration: number; // thời gian cháy (độ góc quay) [20 - 60]
}

export interface EngineParameters {
  geometry: EngineGeometry;
  thermo: EngineThermodynamics;
  valves: ValveTiming;
  ignition: IgnitionConfig;
}

export type StrokeType = 'intake' | 'compression' | 'combustion' | 'exhaust';

export interface StrokeInfo {
  type: StrokeType;
  name: string;
  nominalAngleRange: [number, number]; // [0, 180], [180, 360], [360, 540], [540, 720]
  color: string;
  darkColor: string;
  lightBg: string;
  description: string;
}

export interface ValveState {
  isOpen: boolean;
  lift: number; // 0.0 to 1.0
  liftMm: number; // lift in mm (e.g. max 9 mm)
}

export interface EngineKinematicsState {
  theta: number; // góc trục khuỷu hiện tại (0 - 720 độ)
  thetaRad: number;
  crankRadius: number; // r = S/2 (mm)
  safeConrodLength: number; // L an toàn (mm)
  pistonArea: number; // A (cm2)
  displacedVolume: number; // Vs (cm3)
  clearanceVolume: number; // Vc (cm3)
  pistonDisplacement: number; // x(θ) từ ĐCT (mm)
  pistonDisplacementRatio: number; // x(θ)/S (0.0 ở ĐCT, 1.0 ở ĐCD)
  cylinderVolume: number; // V(θ) (cm3)
  strokeType: StrokeType;
  strokeName: string;
  intakeValve: ValveState;
  exhaustValve: ValveState;
  isSparkActive: boolean;
  conrodAngleRad: number; // góc nghiêng thanh truyền
  pistonY: number; // vị trí y chuẩn hóa cho đồ họa
  crankPinX: number; // vị trí x chốt khuỷu
  crankPinY: number; // vị trí y chốt khuỷu
}

export interface CyclePoint {
  theta: number;
  volume: number; // cm3
  pressure: number; // bar
  temp: number; // K
  stroke: StrokeType;
}

export interface OttoStatePoints {
  p1: number;
  v1: number;
  t1: number;
  p2: number;
  v2: number;
  t2: number;
  p3: number;
  v3: number;
  t3: number;
  p4: number;
  v4: number;
  t4: number;
}

export interface ThermodynamicResults {
  modelType: 'otto' | 'realistic';
  cyclePoints: CyclePoint[]; // 721 points (0 to 720 deg)
  currentPressure: number; // bar
  currentVolume: number; // cm3
  currentTemp: number; // K
  maxPressure: number; // bar
  minPressure: number; // bar
  grossWork: number; // J
  pumpingWork: number; // J
  netWork: number; // W = ∮ p dV (J)
  imep: number; // bar
  indicatedPower: number; // kW
  thermalEfficiency: number; // % (hiệu suất Otto lý tưởng hoặc chu trình thực tế)
  ottoEfficiency: number; // % (1 - 1/ε^(γ-1))
  ottoPoints?: OttoStatePoints;
}

export interface ViewOptions {
  showLabels: boolean;
  showGasArrows: boolean;
  showDCPoints: boolean;
  showCrankTrace: boolean;
  showFullCycleCurve: boolean;
}
