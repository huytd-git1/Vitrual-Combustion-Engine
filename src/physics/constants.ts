import type { EngineParameters, StrokeInfo, StrokeType } from '../types/engine';

export const DEFAULT_PARAMETERS: EngineParameters = {
  geometry: {
    bore: 75, // mm
    stroke: 80, // mm
    conrodLength: 140, // mm
    compressionRatio: 9.5,
  },
  thermo: {
    rpm: 2400, // rpm
    intakePressure: 1.0, // bar
    exhaustPressure: 1.05, // bar
    intakeTemp: 300, // K
    gamma: 1.35, // hệ số nhiệt dung tỉ đối
    heatInput: 1200, // kJ/kg
  },
  valves: {
    intakeAdvance: 12, // α (độ trước ĐCT)
    intakeLag: 40, // β (độ sau ĐCD)
    exhaustAdvance: 45, // γe (độ trước ĐCD)
    exhaustLag: 10, // δ (độ sau ĐCT)
  },
  ignition: {
    sparkAdvance: 15, // độ trước ĐCT
    burnDuration: 40, // độ góc quay
  },
};

export const STROKES_CONFIG: Record<StrokeType, StrokeInfo> = {
  intake: {
    type: 'intake',
    name: 'Kỳ 1: Nạp (Intake)',
    nominalAngleRange: [0, 180],
    color: '#2563eb', // Blue
    darkColor: '#1d4ed8',
    lightBg: 'rgba(37, 99, 235, 0.12)',
    description: 'Piston đi từ ĐCT xuống ĐCD. Xupáp nạp mở, hỗn hợp không khí - nhiên liệu được hút vào xi lanh do chênh lệch áp suất.',
  },
  compression: {
    type: 'compression',
    name: 'Kỳ 2: Nén (Compression)',
    nominalAngleRange: [180, 360],
    color: '#f59e0b', // Amber/Orange
    darkColor: '#d97706',
    lightBg: 'rgba(245, 158, 11, 0.12)',
    description: 'CẢ HAI XUPÁP ĐỀU ĐÓNG. Piston đi từ ĐCD lên ĐCT, nén hỗn hợp khí làm tăng mạnh áp suất và nhiệt độ buồng cháy.',
  },
  combustion: {
    type: 'combustion',
    name: 'Kỳ 3: Cháy – Giãn nở (Power)',
    nominalAngleRange: [360, 540],
    color: '#ef4444', // Red
    darkColor: '#b91c1c',
    lightBg: 'rgba(239, 68, 68, 0.12)',
    description: 'Bugi bật tia lửa điện đốt cháy hòa khí. Khí cháy giãn nở với áp suất và nhiệt độ rất cao, sinh công đẩy piston từ ĐCT xuống ĐCD.',
  },
  exhaust: {
    type: 'exhaust',
    name: 'Kỳ 4: Thải (Exhaust)',
    nominalAngleRange: [540, 720],
    color: '#8b5cf6', // Violet
    darkColor: '#6d28d9',
    lightBg: 'rgba(139, 92, 246, 0.12)',
    description: 'Xupáp thải mở. Piston đi từ ĐCD lên ĐCT đẩy sản phẩm khí cháy ra ngoài ống xả, dọn sạch buồng cháy cho chu trình tiếp theo.',
  },
};

// Gas constant for air
export const R_AIR = 287.058; // J / (kg * K)
export const MAX_VALVE_LIFT_MM = 9.0; // mm
