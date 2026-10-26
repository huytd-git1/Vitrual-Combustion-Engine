import React, { useMemo } from 'react';
import type { EngineKinematicsState, EngineParameters } from '../types/engine';
import { STROKES_CONFIG } from '../physics/constants';

interface ValveTimingDiagramProps {
  params: EngineParameters;
  kinematics: EngineKinematicsState;
  isDarkMode: boolean;
}

export const ValveTimingDiagram: React.FC<ValveTimingDiagramProps> = ({
  params,
  kinematics,
  isDarkMode,
}) => {
  const { intakeAdvance, intakeLag, exhaustAdvance, exhaustLag } = params.valves;
  const sparkAdv = params.ignition.sparkAdvance;

  // Tổng thời gian mở và góc trùng điệp
  const intakeDuration = 180 + intakeAdvance + intakeLag;
  const exhaustDuration = 180 + exhaustAdvance + exhaustLag;
  const overlapAngle = intakeAdvance + exhaustLag;

  // Kích thước SVG
  const size = 420;
  const xc = size / 2;
  const yc = size / 2;

  // Bán kính 2 vòng đồng tâm cho 720 độ
  const rOuter = 145; // Vòng 1: 0 - 360 độ (Nạp & Nén)
  const rInner = 95;  // Vòng 2: 360 - 720 độ (Cháy & Thải)
  const trackWidth = 22;

  // Chuyển đổi góc quay theta (độ, 0 ở 12h, chiều kim đồng hồ) sang tọa độ (x, y)
  const getPoint = (radius: number, deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return {
      x: xc + radius * Math.cos(rad),
      y: yc + radius * Math.sin(rad),
    };
  };

  // Tạo cung tròn SVG (Arc path) từ startDeg đến endDeg theo chiều kim đồng hồ
  const describeArc = (
    radius: number,
    startDeg: number,
    endDeg: number,
    width = trackWidth
  ) => {
    // Chuẩn hóa góc chênh lệch
    let diff = endDeg - startDeg;
    while (diff < 0) diff += 360;
    if (diff === 0) diff = 360;

    const r1 = radius - width / 2;
    const r2 = radius + width / 2;

    const pStartInner = getPoint(r1, startDeg);
    const pEndInner = getPoint(r1, startDeg + diff);
    const pStartOuter = getPoint(r2, startDeg);
    const pEndOuter = getPoint(r2, startDeg + diff);

    const largeArc = diff > 180 ? 1 : 0;

    return `
      M ${pStartInner.x} ${pStartInner.y}
      A ${r1} ${r1} 0 ${largeArc} 1 ${pEndInner.x} ${pEndInner.y}
      L ${pEndOuter.x} ${pEndOuter.y}
      A ${r2} ${r2} 0 ${largeArc} 0 ${pStartOuter.x} ${pStartOuter.y}
      Z
    `;
  };

  // Vị trí con trỏ góc hiện tại
  const currentRadius = kinematics.theta < 360 ? rOuter : rInner;
  const currentAngleOnRing = kinematics.theta % 360;
  const currentPt = getPoint(currentRadius, currentAngleOnRing);

  const colors = {
    bg: isDarkMode ? '#1e293b' : '#ffffff',
    text: isDarkMode ? '#f8fafc' : '#0f172a',
    subText: isDarkMode ? '#94a3b8' : '#64748b',
    border: isDarkMode ? '#334155' : '#e2e8f0',
    centerRing: isDarkMode ? '#0f172a' : '#f1f5f9',
  };

  // Bảng sự kiện phối khí
  const timingEvents = useMemo(() => {
    return [
      {
        event: 'Xupáp nạp mở sớm (α)',
        pos: `${intakeAdvance}° trước ĐCT`,
        angle: `${(720 - intakeAdvance) % 720}°`,
        color: '#2563eb',
      },
      {
        event: 'Xupáp nạp đóng muộn (β)',
        pos: `${intakeLag}° sau ĐCD`,
        angle: `${180 + intakeLag}°`,
        color: '#2563eb',
      },
      {
        event: 'Đánh lửa sớm',
        pos: `${sparkAdv}° trước ĐCT cuối nén`,
        angle: `${360 - sparkAdv}°`,
        color: '#ef4444',
      },
      {
        event: 'Xupáp thải mở sớm (γe)',
        pos: `${exhaustAdvance}° trước ĐCD`,
        angle: `${540 - exhaustAdvance}°`,
        color: '#8b5cf6',
      },
      {
        event: 'Xupáp thải đóng muộn (δ)',
        pos: `${exhaustLag}° sau ĐCT chu trình mới`,
        angle: `${exhaustLag}°`,
        color: '#8b5cf6',
      },
      {
        event: 'Góc trùng điệp xupáp (α + δ)',
        pos: 'Cả hai xupáp cùng mở xung quanh ĐCT',
        angle: `${overlapAngle}°`,
        color: '#10b981',
      },
    ];
  }, [intakeAdvance, intakeLag, exhaustAdvance, exhaustLag, sparkAdv, overlapAngle]);

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-all duration-200">
      {/* Tiêu đề */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900 dark:text-white">
              Đồ thị tròn phối khí 720°
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
              2 vòng quay đồng tâm
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Biểu diễn góc mở sớm / đóng muộn xupáp và góc đánh lửa qua 2 vòng quay trục khuỷu
          </p>
        </div>

        {/* Badge góc trùng điệp */}
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl">
          <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            Trùng điệp xupáp:
          </span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {overlapAngle}°
          </span>
        </div>
      </div>

      {/* Sơ đồ hình tròn */}
      <div className="relative flex justify-center items-center my-2">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[380px] h-auto select-none">
          <defs>
            {/* Bộ lọc đổ bóng */}
            <filter id="diagramShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
            </filter>

            {/* Marker mũi tên chiều quay */}
            <marker id="rotateArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#64748b" />
            </marker>
          </defs>

          {/* Vòng đĩa nền trung tâm */}
          <circle cx={xc} cy={yc} r={rOuter + trackWidth + 12} fill="none" stroke={colors.border} strokeWidth="1" strokeDasharray="4 4" />
          <circle cx={xc} cy={yc} r={rInner - trackWidth - 8} fill={colors.centerRing} stroke={colors.border} strokeWidth="1" />

          {/* Trục tâm và thông tin tốc độ */}
          <text x={xc} y={yc - 8} textAnchor="middle" fill={colors.text} fontSize="12" fontWeight="bold">
            TRỤC KHUỶU
          </text>
          <text x={xc} y={yc + 10} textAnchor="middle" fill={colors.subText} fontSize="10">
            Góc hiện tại:
          </text>
          <text x={xc} y={yc + 28} textAnchor="middle" fill={STROKES_CONFIG[kinematics.strokeType].color} fontSize="15" fontWeight="bold">
            {kinematics.theta.toFixed(1)}°
          </text>

          {/* 1. VÒNG NGOÀI (VÒNG 1: 0° -> 360°) */}
          {/* Cung kỳ Nạp: 0 -> 180 độ */}
          <path
            d={describeArc(rOuter, 0, 180)}
            fill={STROKES_CONFIG.intake.color}
            opacity="0.3"
            stroke={STROKES_CONFIG.intake.color}
            strokeWidth="1"
          />
          {/* Cung kỳ Nén: 180 -> 360 độ */}
          <path
            d={describeArc(rOuter, 180, 360)}
            fill={STROKES_CONFIG.compression.color}
            opacity="0.3"
            stroke={STROKES_CONFIG.compression.color}
            strokeWidth="1"
          />

          {/* 2. VÒNG TRONG (VÒNG 2: 360° -> 720°) */}
          {/* Cung kỳ Cháy – giãn nở: 360 -> 540 độ (tương đương 0 -> 180 độ vòng trong) */}
          <path
            d={describeArc(rInner, 0, 180)}
            fill={STROKES_CONFIG.combustion.color}
            opacity="0.35"
            stroke={STROKES_CONFIG.combustion.color}
            strokeWidth="1"
          />
          {/* Cung kỳ Thải: 540 -> 720 độ (tương đương 180 -> 360 độ vòng trong) */}
          <path
            d={describeArc(rInner, 180, 360)}
            fill={STROKES_CONFIG.exhaust.color}
            opacity="0.35"
            stroke={STROKES_CONFIG.exhaust.color}
            strokeWidth="1"
          />

          {/* 3. CUNG MỞ XUPÁP NẠP THỰC TẾ (Intake Valve Open Arc) */}
          {/* Mở sớm từ 360 - alpha trên vòng 1 (hoặc 720 - alpha) đến 180 + beta */}
          <path
            d={describeArc(rOuter + 8, (360 - intakeAdvance) % 360, 180 + intakeLag, 8)}
            fill="#2563eb"
            opacity="0.9"
          />

          {/* 4. CUNG MỞ XUPÁP THẢI THỰC TẾ (Exhaust Valve Open Arc) */}
          {/* Mở sớm từ 180 - gammaE (540 - gammaE) trên vòng trong đến delta qua 0 độ */}
          <path
            d={describeArc(rInner - 8, (180 - exhaustAdvance) % 360, exhaustLag, 8)}
            fill="#8b5cf6"
            opacity="0.9"
          />

          {/* 5. VÙNG TRÙNG ĐIỆP XUPÁP (Overlap Zone) */}
          {overlapAngle > 0 && (
            <path
              d={describeArc(rOuter + 8, (360 - intakeAdvance) % 360, exhaustLag, 12)}
              fill="#10b981"
              opacity="0.8"
            />
          )}

          {/* 6. ĐIỂM ĐÁNH LỬA SỚM */}
          {(() => {
            const sparkDeg = (360 - sparkAdv) % 360;
            const pt = getPoint(rOuter, sparkDeg);
            return (
              <g>
                <line x1={xc} y1={yc} x2={pt.x} y2={pt.y} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
                <circle cx={pt.x} cy={pt.y} r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                <text x={pt.x - 14} y={pt.y - 8} fill="#ef4444" fontSize="10" fontWeight="bold">
                  ⚡-{sparkAdv}°
                </text>
              </g>
            );
          })()}

          {/* Vạch ĐCT (TDC, 12h) và ĐCD (BDC, 6h) */}
          {/* ĐCT */}
          <line x1={xc} y1={yc - rOuter - trackWidth - 14} x2={xc} y2={yc - rInner + trackWidth + 4} stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
          <text x={xc} y={yc - rOuter - trackWidth - 18} textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="bold">
            ĐCT (0° / 360° / 720°)
          </text>

          {/* ĐCD */}
          <line x1={xc} y1={yc + rInner - trackWidth - 4} x2={xc} y2={yc + rOuter + trackWidth + 14} stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" />
          <text x={xc} y={yc + rOuter + trackWidth + 26} textAnchor="middle" fill="#3b82f6" fontSize="12" fontWeight="bold">
            ĐCD (180° / 540°)
          </text>

          {/* Mũi tên chỉ chiều quay trục khuỷu (chiều kim đồng hồ) */}
          <path
            d={`
              M ${xc + rOuter + 20} ${yc - 35}
              A ${rOuter + 22} ${rOuter + 22} 0 0 1 ${xc + rOuter + 20} ${yc + 35}
            `}
            fill="none"
            stroke="#64748b"
            strokeWidth="1.8"
            markerEnd="url(#rotateArrow)"
          />
          <text x={xc + rOuter + 28} y={yc + 4} fill="#64748b" fontSize="9" fontWeight="600">
            Chiều quay
          </text>

          {/* Nhãn hai vòng quay */}
          <text x={xc - rOuter - 6} y={yc} textAnchor="end" fill="#2563eb" fontSize="9" fontWeight="600">
            Vòng 1 (0–360°)
          </text>
          <text x={xc - rInner + 10} y={yc + 16} textAnchor="end" fill="#ef4444" fontSize="9" fontWeight="600">
            Vòng 2 (360–720°)
          </text>

          {/* CON TRỎ GÓC HIỆN TẠI (Cursor Indicator) */}
          <g id="current-angle-needle">
            {/* Tia từ tâm đến con trỏ */}
            <line
              x1={xc}
              y1={yc}
              x2={currentPt.x}
              y2={currentPt.y}
              stroke={STROKES_CONFIG[kinematics.strokeType].color}
              strokeWidth="2.5"
            />
            {/* Vòng tròn định vị */}
            <circle
              cx={currentPt.x}
              cy={currentPt.y}
              r="7"
              fill={STROKES_CONFIG[kinematics.strokeType].color}
              stroke="#ffffff"
              strokeWidth="2"
            />
          </g>
        </svg>
      </div>

      {/* Chú thích màu các dải */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded bg-blue-600 inline-block"></span>
          <span className="text-slate-600 dark:text-slate-300">
            Mở nạp: <strong className="text-blue-600 dark:text-blue-400">{intakeDuration}°</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded bg-purple-600 inline-block"></span>
          <span className="text-slate-600 dark:text-slate-300">
            Mở thải: <strong className="text-purple-600 dark:text-purple-400">{exhaustDuration}°</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded bg-emerald-500 inline-block"></span>
          <span className="text-slate-600 dark:text-slate-300">
            Trùng điệp: <strong className="text-emerald-600 dark:text-emerald-400">{overlapAngle}°</strong>
          </span>
        </div>
      </div>

      {/* Bảng sự kiện phối khí theo yêu cầu */}
      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="py-2 px-3">Sự kiện</th>
              <th className="py-2 px-3">Vị trí tương đối</th>
              <th className="py-2 px-3 text-right">Góc trục khuỷu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-600 dark:text-slate-300">
            {timingEvents.map((ev, i) => (
              <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-1.5 px-3 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ev.color }}></span>
                  {ev.event}
                </td>
                <td className="py-1.5 px-3">{ev.pos}</td>
                <td className="py-1.5 px-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                  {ev.angle}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
