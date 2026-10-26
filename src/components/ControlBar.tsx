import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Gauge,
  SlidersHorizontal,
} from 'lucide-react';
import type { EngineParameters } from '../types/engine';

interface ControlBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onResetAngle: () => void;
  theta: number;
  onAngleChange: (angle: number) => void;
  playbackSpeed: number; // 0.05 to 1.0 (tỉ lệ làm chậm)
  onPlaybackSpeedChange: (speed: number) => void;
  engineRpm: number;
  onResetDefaults: () => void;
  onSetTheoreticalTiming: () => void;
  params: EngineParameters;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isPlaying,
  onTogglePlay,
  onResetAngle,
  theta,
  onAngleChange,
  playbackSpeed,
  onPlaybackSpeedChange,
  engineRpm,
  onResetDefaults,
  onSetTheoreticalTiming,
  params,
}) => {
  // Tính hệ số làm chậm thực tế
  const slowMoFactor = Math.round((engineRpm / 60) / Math.max(playbackSpeed, 0.01));

  // Kiểm tra xem có đang ở chế độ phối khí lý thuyết không (α=β=γe=δ=0)
  const isTheoretical =
    params.valves.intakeAdvance === 0 &&
    params.valves.intakeLag === 0 &&
    params.valves.exhaustAdvance === 0 &&
    params.valves.exhaustLag === 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-all duration-200">
      {/* Hàng 1: Thanh trượt góc trục khuỷu từ 0° đến 720° */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
          <span className="text-slate-600 dark:text-slate-400">
            Góc trục khuỷu <strong className="text-blue-600 dark:text-blue-400 font-bold text-sm">θ = {theta.toFixed(1)}°</strong>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">Chu trình 720° (2 vòng)</span>
          </div>
        </div>

        {/* Thanh trượt góc với vạch chia các kỳ */}
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max="720"
            step="0.5"
            value={theta}
            onChange={(e) => onAngleChange(parseFloat(e.target.value))}
            className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
          />
        </div>

        {/* Đánh dấu 4 kỳ dưới thanh trượt */}
        <div className="grid grid-cols-4 text-[11px] font-semibold mt-1.5 pt-0.5 border-t border-slate-100 dark:border-slate-800">
          <div
            onClick={() => onAngleChange(90)}
            className="text-left text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
          >
            0° Nạp (ĐCT)
          </div>
          <div
            onClick={() => onAngleChange(270)}
            className="text-center text-amber-600 dark:text-amber-400 cursor-pointer hover:underline"
          >
            180° Nén (ĐCD)
          </div>
          <div
            onClick={() => onAngleChange(450)}
            className="text-center text-red-600 dark:text-red-400 cursor-pointer hover:underline"
          >
            360° Cháy (ĐCT)
          </div>
          <div
            onClick={() => onAngleChange(630)}
            className="text-right text-purple-600 dark:text-purple-400 cursor-pointer hover:underline"
          >
            540° Thải (ĐCD) - 720°
          </div>
        </div>
      </div>

      {/* Hàng 2: Các nút điều khiển phát, từng bước và tốc độ */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Nhóm nút Playback */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm shadow-sm transition-all ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            title={isPlaying ? 'Tạm dừng (Phím Space)' : 'Chạy mô phỏng (Phím Space)'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'Tạm dừng' : 'Chạy'}</span>
          </button>

          <button
            onClick={onResetAngle}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Khởi động lại về 0°"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 ml-1">
            <button
              onClick={() => onAngleChange((theta - 5 + 720) % 720)}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 transition-colors"
              title="Lùi 5°"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onAngleChange((theta - 1 + 720) % 720)}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 transition-colors"
              title="Lùi 1°"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onAngleChange((theta + 1) % 720)}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 transition-colors"
              title="Tiến 1°"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onAngleChange((theta + 5) % 720)}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 transition-colors"
              title="Tiến 5°"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nhóm điều chỉnh tốc độ phát & làm chậm */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
            <Gauge className="w-4 h-4 text-blue-500" />
            <span>Tốc độ phát:</span>
          </div>
          <div className="flex items-center gap-2">
            {[0.05, 0.15, 0.3, 0.6, 1.0].map((spd) => (
              <button
                key={spd}
                onClick={() => onPlaybackSpeedChange(spd)}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                  Math.abs(playbackSpeed - spd) < 0.02
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {spd === 1.0 ? '1.0x' : `${spd}x`}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-2">
            Làm chậm: <strong className="text-slate-800 dark:text-slate-200">{slowMoFactor}x</strong>
          </span>
        </div>

        {/* Nhóm khôi phục & Phối khí lý thuyết */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSetTheoreticalTiming}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              isTheoretical
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
            }`}
            title="Đặt các góc mở sớm/đóng muộn bằng 0°"
          >
            Phối khí lý thuyết (0°)
          </button>

          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="Khôi phục toàn bộ thông số về giá trị mặc định"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Mặc định</span>
          </button>
        </div>
      </div>
    </div>
  );
};
