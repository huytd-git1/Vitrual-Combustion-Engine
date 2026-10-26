import React from 'react';
import type { EngineKinematicsState, EngineParameters, ThermodynamicResults } from '../types/engine';
import { MathView } from './MathView';
import { Calculator, Info } from 'lucide-react';

interface CalculatedResultsProps {
  params: EngineParameters;
  kinematics: EngineKinematicsState;
  thermo: ThermodynamicResults;
  modelType: 'otto' | 'realistic';
}

export const CalculatedResults: React.FC<CalculatedResultsProps> = ({
  params,
  kinematics,
  thermo,
  modelType,
}) => {
  // Đổi công suất chỉ thị sang mã lực HP: 1 kW = 1.35962 HP
  const indicatedHp = thermo.indicatedPower * 1.35962;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-all duration-200">
      {/* Tiêu đề */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Thông số & Kết quả nhiệt động học
          </h3>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {modelType === 'otto' ? 'Theo chu trình Otto lý tưởng' : 'Theo chu trình 4 kỳ gần thực tế'}
        </span>
      </div>

      {/* Grid kết quả chính */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. Dung tích công tác Vs */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Dung tích công tác Vs
          </span>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {kinematics.displacedVolume.toFixed(1)} <span className="text-xs font-normal text-slate-500">cm³</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            <MathView math="V_s = \frac{\pi D^2}{4} \cdot S" />
          </div>
        </div>

        {/* 2. Thể tích buồng cháy Vc & Tỷ số nén */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Buồng cháy Vc & Tỷ số nén
          </span>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {kinematics.clearanceVolume.toFixed(1)} <span className="text-xs font-normal text-slate-500">cm³</span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 ml-1.5">
              (ε = {params.geometry.compressionRatio})
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            <MathView math="V_c = \frac{V_s}{\varepsilon - 1}" />
          </div>
        </div>

        {/* 3. Áp suất cực đại Pmax */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Áp suất cực đại Pmax
          </span>
          <div className="text-lg font-bold text-red-600 dark:text-red-400 mt-0.5">
            {thermo.maxPressure.toFixed(1)} <span className="text-xs font-normal text-slate-500">bar</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Tại đỉnh quá trình cháy
          </div>
        </div>

        {/* 4. Hiệu suất nhiệt */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Hiệu suất nhiệt {modelType === 'otto' ? 'lý tưởng η_otto' : 'ước tính'}
          </span>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {thermo.thermalEfficiency.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            <MathView math="\eta = 1 - \frac{1}{\varepsilon^{\gamma-1}}" />
          </div>
        </div>

        {/* 5. Công chu trình W */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Công chu trình W
          </span>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5">
            {thermo.netWork.toFixed(1)} <span className="text-xs font-normal text-slate-500">J/chu trình</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            <MathView math="W = \oint p \, dV" />
          </div>
        </div>

        {/* 6. Áp suất chỉ thị trung bình IMEP */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Áp suất chỉ thị TB (IMEP)
          </span>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {thermo.imep.toFixed(2)} <span className="text-xs font-normal text-slate-500">bar</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            <MathView math="\text{IMEP} = \frac{W}{V_s}" />
          </div>
        </div>

        {/* 7. Công suất chỉ thị Pi */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 sm:col-span-2">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Công suất chỉ thị ước tính Pi (ở {params.thermo.rpm} rpm)
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {thermo.indicatedPower.toFixed(2)} kW
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              (~{indicatedHp.toFixed(2)} mã lực HP)
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            <MathView math="P_i = \frac{W \cdot N}{120} \quad (\text{động cơ 4 kỳ 1 xi lanh})" />
          </div>
        </div>
      </div>

      {/* Cảnh báo sư phạm quan trọng: Phân biệt công suất chỉ thị Pi và công suất có ích Pe */}
      <div className="mt-3 p-3 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-800/50 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-blue-900 dark:text-blue-200">
            * Kết quả ước tính theo mô hình nhiệt động học 0D:
          </span>
          <p className="leading-relaxed">
            Công suất tính ở trên là <strong className="text-blue-700 dark:text-blue-300">Công suất chỉ thị (Indicated Power - Pi)</strong> sinh ra trên đỉnh piston bởi áp suất khí.
            Cần phân biệt với <strong className="text-slate-900 dark:text-white">Công suất có ích tại trục khuỷu (Brake Power - Pe)</strong>:
            <span className="inline-block mx-1">
              <MathView math="P_e = P_i \cdot \eta_m" />
            </span>
            với <MathView math="\eta_m \approx 0.80 - 0.88" /> là hiệu suất cơ giới tính đến ma sát xéc-măng, ổ trượt và dẫn động bơm dầu, cam.
          </p>
        </div>
      </div>
    </div>
  );
};
