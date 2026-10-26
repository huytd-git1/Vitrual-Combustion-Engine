import React, { useState, useMemo, useRef } from 'react';
import type { EngineKinematicsState, EngineParameters, ThermodynamicResults } from '../types/engine';
import { STROKES_CONFIG } from '../physics/constants';
import { ZoomIn, ZoomOut, RotateCcw, Download, Info } from 'lucide-react';
import { MathView } from './MathView';

interface PVDiagramProps {
  params: EngineParameters;
  kinematics: EngineKinematicsState;
  thermoResults: ThermodynamicResults;
  modelType: 'otto' | 'realistic';
  onModelTypeChange: (type: 'otto' | 'realistic') => void;
  isDarkMode: boolean;
}

export const PVDiagram: React.FC<PVDiagramProps> = ({
  params: _params,
  kinematics,
  thermoResults,
  modelType,
  onModelTypeChange,
  isDarkMode,
}) => {
  const [showFullCycle, setShowFullCycle] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; v: number; p: number; stroke: string } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  // Kích thước khung đồ thị
  const width = 500;
  const height = 380;
  const margin = { top: 35, right: 35, bottom: 50, left: 60 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // Tính miền giá trị (V_min, V_max, P_min, P_max)
  const vMin = Math.max(0, kinematics.clearanceVolume * 0.85);
  const vMax = (kinematics.clearanceVolume + kinematics.displacedVolume) * 1.08;
  const pMin = 0;
  const pMax = Math.max(thermoResults.maxPressure * 1.15, 20);

  // Hàm chuyển đổi tọa độ thực (V, p) sang tọa độ pixel SVG
  const scaleX = (v: number) => {
    const norm = (v - vMin) / (vMax - vMin);
    return margin.left + norm * plotWidth;
  };

  const scaleY = (p: number) => {
    const norm = (p - pMin) / (pMax - pMin);
    return margin.top + plotHeight - norm * plotHeight;
  };

  // Tọa độ điểm hiện tại
  const currentX = scaleX(thermoResults.currentVolume);
  const currentY = scaleY(thermoResults.currentPressure);

  // Tạo đường dẫn SVG cho các kỳ
  const strokePaths = useMemo(() => {
    const pts = thermoResults.cyclePoints;
    const paths: { stroke: string; color: string; d: string }[] = [];

    const strokes: { name: string; color: string; start: number; end: number }[] = [
      { name: 'Kỳ nạp (0° - 180°)', color: STROKES_CONFIG.intake.color, start: 0, end: 180 },
      { name: 'Kỳ nén (180° - 360°)', color: STROKES_CONFIG.compression.color, start: 180, end: 360 },
      { name: 'Kỳ cháy – giãn nở (360° - 540°)', color: STROKES_CONFIG.combustion.color, start: 360, end: 540 },
      { name: 'Kỳ thải (540° - 720°)', color: STROKES_CONFIG.exhaust.color, start: 540, end: 720 },
    ];

    for (const s of strokes) {
      let d = '';
      for (let deg = s.start; deg <= s.end; deg++) {
        if (!showFullCycle && deg > kinematics.theta) {
          break;
        }
        const pt = pts[deg];
        if (!pt) continue;
        const px = scaleX(pt.volume);
        const py = scaleY(pt.pressure);
        if (d === '') {
          d += `M ${px.toFixed(1)} ${py.toFixed(1)}`;
        } else {
          d += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
        }
      }
      if (d !== '') {
        paths.push({ stroke: s.name, color: s.color, d });
      }
    }

    return paths;
  }, [thermoResults.cyclePoints, showFullCycle, kinematics.theta, vMin, vMax, pMin, pMax]);

  // Các điểm trạng thái đặc trưng của chu trình Otto (1, 2, 3, 4)
  const ottoMarkers = useMemo(() => {
    if (modelType !== 'otto' || !thermoResults.ottoPoints) return null;
    const { p1, v1, p2, v2, p3, v3, p4, v4, t1, t2, t3, t4 } = thermoResults.ottoPoints;

    return [
      { id: '1', label: '1', v: v1, p: p1, t: t1, desc: 'Đầu kỳ nén (ĐCD)', x: scaleX(v1), y: scaleY(p1) },
      { id: '2', label: '2', v: v2, p: p2, t: t2, desc: 'Cuối nén đoạn nhiệt (ĐCT)', x: scaleX(v2), y: scaleY(p2) },
      { id: '3', label: '3', v: v3, p: p3, t: t3, desc: 'Đỉnh cháy đẳng tích (ĐCT)', x: scaleX(v3), y: scaleY(p3) },
      { id: '4', label: '4', v: v4, p: p4, t: t4, desc: 'Cuối giãn nở đoạn nhiệt (ĐCD)', x: scaleX(v4), y: scaleY(p4) },
    ];
  }, [modelType, thermoResults.ottoPoints, vMin, vMax, pMin, pMax]);

  // Lưới tọa độ
  const gridTicks = useMemo(() => {
    const vSteps = 5;
    const pSteps = 5;
    const vTicks: { val: number; x: number }[] = [];
    const pTicks: { val: number; y: number }[] = [];

    for (let i = 0; i <= vSteps; i++) {
      const val = vMin + ((vMax - vMin) * i) / vSteps;
      vTicks.push({ val: Math.round(val), x: scaleX(val) });
    }

    for (let i = 0; i <= pSteps; i++) {
      const val = pMin + ((pMax - pMin) * i) / pSteps;
      pTicks.push({ val: Math.round(val), y: scaleY(val) });
    }

    return { vTicks, pTicks };
  }, [vMin, vMax, pMin, pMax]);

  // Xuất ảnh đồ thị PNG
  const handleExportPng = () => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = isDarkMode ? '#0f172a' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `do_thi_pV_${modelType}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
      }
    };
    img.src = url;
  };

  const colors = {
    grid: isDarkMode ? '#334155' : '#e2e8f0',
    axis: isDarkMode ? '#94a3b8' : '#64748b',
    text: isDarkMode ? '#cbd5e1' : '#475569',
  };

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-all duration-200">
      {/* Tiêu đề & Công cụ điều khiển chế độ */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900 dark:text-white">
              Đồ thị công p–V
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              {modelType === 'otto' ? 'Chu trình Otto lý tưởng' : 'Chu trình gần thực tế'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mối liên hệ giữa áp suất buồng cháy p và thể tích xi lanh V
          </p>
        </div>

        {/* Nút chọn chế độ mô hình */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => onModelTypeChange('otto')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              modelType === 'otto'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Otto lý tưởng
          </button>
          <button
            onClick={() => onModelTypeChange('realistic')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              modelType === 'realistic'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Gần thực tế (4 kỳ)
          </button>
        </div>
      </div>

      {/* Tùy chọn hiển thị & Phóng to / Thu nhỏ */}
      <div className="flex flex-wrap items-center justify-between text-xs gap-2 mb-2">
        <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={showFullCycle}
            onChange={(e) => setShowFullCycle(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Hiện toàn chu trình</span>
        </label>

        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2.0))}
            title="Phóng to"
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
            title="Thu nhỏ"
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoomLevel(1.0);
              setPanOffset({ x: 0, y: 0 });
            }}
            title="Đặt lại khung nhìn"
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportPng}
            title="Tải ảnh đồ thị PNG"
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-blue-600 dark:text-blue-400"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Khung vẽ SVG p-V */}
      <div className="relative w-full overflow-hidden border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          style={{ transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)` }}
        >
          {/* Lưới tọa độ ngang & dọc */}
          <g id="grid" stroke={colors.grid} strokeWidth="1" strokeDasharray="3 3">
            {gridTicks.vTicks.map((tick, i) => (
              <line key={`v-${i}`} x1={tick.x} y1={margin.top} x2={tick.x} y2={margin.top + plotHeight} />
            ))}
            {gridTicks.pTicks.map((tick, i) => (
              <line key={`p-${i}`} x1={margin.left} y1={tick.y} x2={margin.left + plotWidth} y2={tick.y} />
            ))}
          </g>

          {/* Vạch ranh giới Vc (ĐCT) và Vc + Vs (ĐCD) */}
          <line
            x1={scaleX(kinematics.clearanceVolume)}
            y1={margin.top}
            x2={scaleX(kinematics.clearanceVolume)}
            y2={margin.top + plotHeight}
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.7"
          />
          <text
            x={scaleX(kinematics.clearanceVolume) - 4}
            y={margin.top + 14}
            textAnchor="end"
            fill="#ef4444"
            fontSize="10"
            fontWeight="bold"
          >
            Vc (ĐCT)
          </text>

          <line
            x1={scaleX(kinematics.clearanceVolume + kinematics.displacedVolume)}
            y1={margin.top}
            x2={scaleX(kinematics.clearanceVolume + kinematics.displacedVolume)}
            y2={margin.top + plotHeight}
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.7"
          />
          <text
            x={scaleX(kinematics.clearanceVolume + kinematics.displacedVolume) - 4}
            y={margin.top + 14}
            textAnchor="end"
            fill="#3b82f6"
            fontSize="10"
            fontWeight="bold"
          >
            Vmax (ĐCD)
          </text>

          {/* Trục hoành và trục tung */}
          <line
            x1={margin.left}
            y1={margin.top + plotHeight}
            x2={margin.left + plotWidth}
            y2={margin.top + plotHeight}
            stroke={colors.axis}
            strokeWidth="2"
          />
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={margin.top + plotHeight}
            stroke={colors.axis}
            strokeWidth="2"
          />

          {/* Nhãn trục */}
          <text
            x={margin.left + plotWidth / 2}
            y={height - 12}
            textAnchor="middle"
            fill={colors.text}
            fontSize="11"
            fontWeight="600"
          >
            Thể tích xi lanh V (cm³)
          </text>
          <text
            x={-height / 2 + 10}
            y={18}
            textAnchor="middle"
            fill={colors.text}
            fontSize="11"
            fontWeight="600"
            transform="rotate(-90)"
          >
            Áp suất tuyệt đối p (bar)
          </text>

          {/* Nhãn các vạch số trên trục */}
          {gridTicks.vTicks.map((t, i) => (
            <text key={`vt-${i}`} x={t.x} y={margin.top + plotHeight + 16} textAnchor="middle" fill={colors.text} fontSize="9">
              {t.val}
            </text>
          ))}
          {gridTicks.pTicks.map((t, i) => (
            <text key={`pt-${i}`} x={margin.left - 8} y={t.y + 3} textAnchor="end" fill={colors.text} fontSize="9">
              {t.val}
            </text>
          ))}

          {/* Các đường cong chu trình p-V */}
          {strokePaths.map((p, idx) => (
            <path
              key={idx}
              d={p.d}
              fill="none"
              stroke={p.color}
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Với chu trình Otto lý tưởng: vẽ đoạn cấp nhiệt 2->3 và thải nhiệt 4->1 đẳng tích */}
          {modelType === 'otto' && thermoResults.ottoPoints && (
            <g id="otto-isochoric-lines">
              <line
                x1={scaleX(thermoResults.ottoPoints.v2)}
                y1={scaleY(thermoResults.ottoPoints.p2)}
                x2={scaleX(thermoResults.ottoPoints.v3)}
                y2={scaleY(thermoResults.ottoPoints.p3)}
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
              <line
                x1={scaleX(thermoResults.ottoPoints.v4)}
                y1={scaleY(thermoResults.ottoPoints.p4)}
                x2={scaleX(thermoResults.ottoPoints.v1)}
                y2={scaleY(thermoResults.ottoPoints.p1)}
                stroke="#8b5cf6"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
            </g>
          )}

          {/* Đánh dấu các điểm trạng thái đặc trưng của Otto */}
          {ottoMarkers &&
            ottoMarkers.map((m) => (
              <g
                key={m.id}
                className="cursor-pointer transition-transform hover:scale-125"
                onMouseEnter={() => setHoveredPoint({ x: m.x, y: m.y, v: m.v, p: m.p, stroke: `Điểm ${m.label}: ${m.desc}` })}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle cx={m.x} cy={m.y} r="6" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                <text x={m.x + 8} y={m.y - 6} fill="#2563eb" fontSize="12" fontWeight="bold">
                  {m.label}
                </text>
              </g>
            ))}

          {/* Điểm làm việc tức thời chạy theo góc trục khuỷu θ */}
          <g id="current-operating-point">
            <circle
              cx={currentX}
              cy={currentY}
              r="10"
              fill={STROKES_CONFIG[kinematics.strokeType].color}
              opacity="0.3"
              className="animate-ping"
            />
            <circle
              cx={currentX}
              cy={currentY}
              r="6.5"
              fill={STROKES_CONFIG[kinematics.strokeType].color}
              stroke="#ffffff"
              strokeWidth="2.5"
            />
          </g>
        </svg>

        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/90 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg border border-slate-700"
            style={{ left: `${hoveredPoint.x + 10}px`, top: `${hoveredPoint.y - 30}px` }}
          >
            <div className="font-bold text-amber-400">{hoveredPoint.stroke}</div>
            <div>V = {hoveredPoint.v.toFixed(1)} cm³</div>
            <div>p = {hoveredPoint.p.toFixed(2)} bar</div>
          </div>
        )}
      </div>

      {/* Chú giải các kỳ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block shrink-0"></span>
          <span className="text-slate-600 dark:text-slate-300">Nạp (0–180°)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shrink-0"></span>
          <span className="text-slate-600 dark:text-slate-300">Nén (180–360°)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block shrink-0"></span>
          <span className="text-slate-600 dark:text-slate-300">Cháy-nở (360–540°)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-purple-500 inline-block shrink-0"></span>
          <span className="text-slate-600 dark:text-slate-300">Thải (540–720°)</span>
        </div>
      </div>

      {/* Giải thích mô hình & Giới hạn */}
      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        {modelType === 'otto' ? (
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Giả thiết chu trình Otto lý tưởng:
            </span>{' '}
            Môi chất là khí lý tưởng, nén và giãn nở đoạn nhiệt thuận nghịch (<MathView math="s = \text{const}" />),
            cấp và thải nhiệt tức thời ở thể tích không đổi (<MathView math="v = \text{const}" />). Không phụ thuộc góc phối khí hay thời gian cháy.
            Hiệu suất nhiệt lý tưởng:{' '}
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {thermoResults.ottoEfficiency.toFixed(1)}%
            </span>{' '}
            (<MathView math="\eta = 1 - 1/\varepsilon^{\gamma-1}" />).
          </div>
        ) : (
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Mô hình 4 kỳ gần thực tế:
            </span>{' '}
            Có xét tổn thất nạp/thải theo RPM, quá trình cháy hữu hạn theo hàm Wiebe bắt đầu từ góc đánh lửa sớm,
            và xả sớm (blowdown).{' '}
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              * Lưu ý: Đánh lửa quá sớm sẽ làm áp suất tăng sớm trước ĐCT, gây cản trở piston và làm giảm công suất có ích!
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
