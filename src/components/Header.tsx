import React, { useState } from 'react';
import type { EngineParameters, ViewOptions } from '../types/engine';
import {
  Sun,
  Moon,
  FileSpreadsheet,
  BookOpen,
  X,
} from 'lucide-react';
import { MathView } from './MathView';
import { DEFAULT_PARAMETERS } from '../physics/constants';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  viewOptions: ViewOptions;
  onViewOptionsChange: (opts: ViewOptions) => void;
  onApplyPreset: (params: EngineParameters) => void;
  onExportCsv: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleDarkMode,
  viewOptions,
  onViewOptionsChange,
  onApplyPreset,
  onExportCsv,
}) => {
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  // Danh sách các cấu hình mẫu (Presets)
  const presets = [
    {
      name: 'Tiêu chuẩn',
      desc: 'Động cơ xăng phổ thông',
      params: DEFAULT_PARAMETERS,
    },
    {
      name: 'Thể thao (Tua cao)',
      desc: '5200 rpm, tỷ số nén 11.2, xupáp mở rộng',
      params: {
        geometry: { bore: 82, stroke: 75, conrodLength: 145, compressionRatio: 11.2 },
        thermo: { rpm: 5200, intakePressure: 1.05, exhaustPressure: 1.1, intakeTemp: 295, gamma: 1.34, heatInput: 1500 },
        valves: { intakeAdvance: 24, intakeLag: 55, exhaustAdvance: 58, exhaustLag: 20 },
        ignition: { sparkAdvance: 25, burnDuration: 35 },
      },
    },
    {
      name: 'Tiết kiệm (Atkinson)',
      desc: 'Tỷ số nén cao 13.0, đóng muộn nạp 65°',
      params: {
        geometry: { bore: 73, stroke: 85, conrodLength: 150, compressionRatio: 13.0 },
        thermo: { rpm: 1800, intakePressure: 0.95, exhaustPressure: 1.02, intakeTemp: 300, gamma: 1.36, heatInput: 1000 },
        valves: { intakeAdvance: 8, intakeLag: 68, exhaustAdvance: 35, exhaustLag: 6 },
        ignition: { sparkAdvance: 14, burnDuration: 45 },
      },
    },
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Logo & Tiêu đề ứng dụng */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <span className="text-xl font-black">4K</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Mô Phỏng Động Cơ Đốt Trong 4 Kỳ
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                Tương tác 2D
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Giảng dạy nguyên lý hoạt động, cơ cấu thanh truyền – trục khuỷu, đồ thị p–V và phối khí 720°
            </p>
          </div>
        </div>

        {/* Thanh công cụ phụ trợ: Presets, Bật/tắt chi tiết, Xuất CSV, Công thức & Chế độ tối */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <span className="text-slate-500 text-[11px] px-2 font-medium hidden lg:inline">
              Mẫu:
            </span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => onApplyPreset(p.params)}
                className="px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 font-medium transition-all"
                title={p.desc}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() =>
                onViewOptionsChange({ ...viewOptions, showLabels: !viewOptions.showLabels })
              }
              className={`px-2 py-1 rounded-lg font-medium transition-all ${
                viewOptions.showLabels
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
              title="Bật/tắt tên các chi tiết động cơ"
            >
              Tên chi tiết
            </button>
            <button
              onClick={() =>
                onViewOptionsChange({
                  ...viewOptions,
                  showGasArrows: !viewOptions.showGasArrows,
                })
              }
              className={`px-2 py-1 rounded-lg font-medium transition-all ${
                viewOptions.showGasArrows
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
              title="Bật/tắt mũi tên minh họa dòng khí"
            >
              Dòng khí
            </button>
            <button
              onClick={() =>
                onViewOptionsChange({
                  ...viewOptions,
                  showDCPoints: !viewOptions.showDCPoints,
                })
              }
              className={`px-2 py-1 rounded-lg font-medium transition-all ${
                viewOptions.showDCPoints
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
              title="Bật/tắt vạch ĐCT và ĐCD"
            >
              ĐCT/ĐCD
            </button>
          </div>

          <button
            onClick={() => setShowFormulaModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Xem bảng công thức tính toán"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline font-medium">Công thức</span>
          </button>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Xuất bảng dữ liệu chu trình 720° ra file CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline font-medium">Xuất CSV</span>
          </button>

          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>

      {showFormulaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Công thức tính toán Động cơ 4 kỳ
                </h3>
              </div>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5">
                <span className="font-bold text-blue-600 dark:text-blue-400 block">
                  1. Vị trí piston x(θ) và Thể tích xi lanh V(θ):
                </span>
                <MathView math="x(\theta) = r(1 - \cos\theta) + L - \sqrt{L^2 - r^2\sin^2\theta}" block />
                <MathView math="V(\theta) = V_c + \frac{\pi D^2}{4} \cdot x(\theta) = V_c + A \cdot x(\theta)" block />
                <p className="text-xs text-slate-500">
                  Trong đó: r = S/2 là bán kính khuỷu, L là chiều dài thanh truyền, D là đường kính xi lanh, Vc là thể tích buồng cháy.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5">
                <span className="font-bold text-amber-600 dark:text-amber-400 block">
                  2. Thể tích công tác và Thể tích buồng cháy:
                </span>
                <MathView math="V_s = \frac{\pi D^2}{4} \cdot S, \quad V_c = \frac{V_s}{\varepsilon - 1}, \quad \varepsilon = \frac{V_c + V_s}{V_c}" block />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                  3. Hiệu suất nhiệt chu trình Otto lý tưởng:
                </span>
                <MathView math="\eta_{otto} = 1 - \frac{1}{\varepsilon^{\gamma - 1}}" block />
                <p className="text-xs text-slate-500">
                  γ là hệ số nhiệt dung đẳng áp / đẳng tích (Cp / Cv). Hiệu suất tăng khi tăng tỷ số nén ε và hệ số γ.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5">
                <span className="font-bold text-purple-600 dark:text-purple-400 block">
                  4. Công chu trình W và Công suất chỉ thị Pi:
                </span>
                <MathView math="W = \oint p \, dV \quad (\text{J/chu trình})" block />
                <MathView math="\text{IMEP} = \frac{W}{V_s} \quad (\text{bar}), \quad P_i = \frac{W \cdot N}{120} \quad (\text{W})" block />
                <p className="text-xs text-slate-500">
                  Với động cơ 4 kỳ một xi lanh, trong 1 phút có N/2 chu trình sinh công (N/120 chu trình/giây).
                </p>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
