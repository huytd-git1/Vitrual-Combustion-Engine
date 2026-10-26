import React from 'react';
import type { EngineKinematicsState, ThermodynamicResults } from '../types/engine';
import { STROKES_CONFIG } from '../physics/constants';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface StatusBannerProps {
  kinematics: EngineKinematicsState;
  thermo: ThermodynamicResults;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ kinematics, thermo }) => {
  const strokeConfig = STROKES_CONFIG[kinematics.strokeType];

  const isPistonMovingDown =
    (kinematics.theta >= 0 && kinematics.theta < 180) ||
    (kinematics.theta >= 360 && kinematics.theta < 540);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
      {/* 1. Kỳ hiện tại */}
      <div
        className="flex flex-col justify-between p-3 rounded-2xl border transition-all"
        style={{
          backgroundColor: strokeConfig.lightBg,
          borderColor: `${strokeConfig.color}40`,
        }}
      >
        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
          Kỳ hiện tại
        </span>
        <div className="flex items-center gap-1.5 mt-1">
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: strokeConfig.color }}
          ></span>
          <span className="text-sm font-bold" style={{ color: strokeConfig.color }}>
            {strokeConfig.name.split(':')[1]?.trim() || strokeConfig.name}
          </span>
        </div>
      </div>

      {/* 2. Góc trục khuỷu & Chiều piston */}
      <div className="flex flex-col justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span>Góc trục khuỷu</span>
          <span className="flex items-center text-[10px] text-slate-700 dark:text-slate-300 font-semibold">
            {isPistonMovingDown ? (
              <>
                <ArrowDown className="w-3 h-3 text-blue-500 mr-0.5" /> Xuống
              </>
            ) : (
              <>
                <ArrowUp className="w-3 h-3 text-red-500 mr-0.5" /> Lên
              </>
            )}
          </span>
        </div>
        <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
          {kinematics.theta.toFixed(1)}°
        </div>
      </div>

      {/* 3. Vị trí piston x(θ) */}
      <div className="flex flex-col justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          Vị trí piston x(θ)
        </span>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            {kinematics.pistonDisplacement.toFixed(1)}
          </span>
          <span className="text-xs text-slate-500">mm từ ĐCT</span>
        </div>
      </div>

      {/* 4. Thể tích xi lanh V(θ) */}
      <div className="flex flex-col justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          Thể tích xi lanh V
        </span>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            {thermo.currentVolume.toFixed(1)}
          </span>
          <span className="text-xs text-slate-500">cm³</span>
        </div>
      </div>

      {/* 5. Áp suất buồng cháy p(θ) */}
      <div className="flex flex-col justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          Áp suất xi lanh p
        </span>
        <div className="flex items-baseline gap-1 mt-1">
          <span
            className="text-lg font-bold"
            style={{ color: thermo.currentPressure > 10 ? '#ef4444' : 'inherit' }}
          >
            {thermo.currentPressure.toFixed(2)}
          </span>
          <span className="text-xs text-slate-500">bar</span>
        </div>
      </div>

      {/* 6. Trạng thái xupáp & bugi */}
      <div className="flex flex-col justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          Trạng thái xupáp & bugi
        </span>
        <div className="flex items-center gap-2 mt-1 text-xs">
          <span
            className={`px-1.5 py-0.5 rounded font-semibold text-[10px] ${
              kinematics.intakeValve.isOpen
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
            }`}
            title={`Xupáp nạp: ${kinematics.intakeValve.isOpen ? `Mở ${(kinematics.intakeValve.lift * 100).toFixed(0)}% (${kinematics.intakeValve.liftMm.toFixed(1)} mm)` : 'Đóng'}`}
          >
            Nạp: {kinematics.intakeValve.isOpen ? `${kinematics.intakeValve.liftMm.toFixed(1)}mm` : 'Đóng'}
          </span>

          <span
            className={`px-1.5 py-0.5 rounded font-semibold text-[10px] ${
              kinematics.exhaustValve.isOpen
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300'
                : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
            }`}
            title={`Xupáp thải: ${kinematics.exhaustValve.isOpen ? `Mở ${(kinematics.exhaustValve.lift * 100).toFixed(0)}% (${kinematics.exhaustValve.liftMm.toFixed(1)} mm)` : 'Đóng'}`}
          >
            Thải: {kinematics.exhaustValve.isOpen ? `${kinematics.exhaustValve.liftMm.toFixed(1)}mm` : 'Đóng'}
          </span>

          {kinematics.isSparkActive && (
            <span className="flex items-center text-amber-500 font-bold animate-bounce" title="Bugi đang phóng tia lửa điện">
              ⚡
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
