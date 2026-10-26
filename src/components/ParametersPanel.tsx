import React, { useState } from 'react';
import type { EngineKinematicsState, EngineParameters } from '../types/engine';
import { Settings2, Flame, Wrench, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';
import { calculateEngineGeometryDerived } from '../physics/kinematics';

interface ParametersPanelProps {
  params: EngineParameters;
  onChange: (newParams: EngineParameters) => void;
  kinematics: EngineKinematicsState;
  onResetDefaults: () => void;
}

export const ParametersPanel: React.FC<ParametersPanelProps> = ({
  params,
  onChange,
  kinematics,
  onResetDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<'geo' | 'thermo' | 'valves' | 'ignition'>('geo');

  const { crankRadius, pistonAreaCm2, displacedVolumeCm3, clearanceVolumeCm3 } =
    calculateEngineGeometryDerived(params.geometry);

  const updateGeometry = (field: keyof EngineParameters['geometry'], value: number) => {
    const updated = { ...params.geometry, [field]: value };
    const r = updated.stroke / 2;
    if (updated.conrodLength <= r) {
      updated.conrodLength = Math.round(r * 1.1);
    }
    onChange({ ...params, geometry: updated });
  };

  const updateThermo = (field: keyof EngineParameters['thermo'], value: number) => {
    onChange({
      ...params,
      thermo: { ...params.thermo, [field]: value },
    });
  };

  const updateValves = (field: keyof EngineParameters['valves'], value: number) => {
    onChange({
      ...params,
      valves: { ...params.valves, [field]: value },
    });
  };

  const updateIgnition = (field: keyof EngineParameters['ignition'], value: number) => {
    onChange({
      ...params,
      ignition: { ...params.ignition, [field]: value },
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Bảng điều chỉnh tham số
          </h3>
        </div>
        <button
          onClick={onResetDefaults}
          className="text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đặt lại</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('geo')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all ${
            activeTab === 'geo'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>1. Hình học</span>
        </button>
        <button
          onClick={() => setActiveTab('thermo')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all ${
            activeTab === 'thermo'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>2. Vận hành</span>
        </button>
        <button
          onClick={() => setActiveTab('valves')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all ${
            activeTab === 'valves'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>3. Phối khí</span>
        </button>
        <button
          onClick={() => setActiveTab('ignition')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all ${
            activeTab === 'ignition'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>4. Đánh lửa</span>
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'geo' && (
          <div className="space-y-3.5">
            <ParameterSlider
              label="Đường kính xi lanh D"
              symbol="D"
              unit="mm"
              value={params.geometry.bore}
              min={50}
              max={120}
              step={1}
              description="Ảnh hưởng trực tiếp đến diện tích piston A và dung tích công tác xi lanh"
              onChange={(v) => updateGeometry('bore', v)}
            />

            <ParameterSlider
              label="Hành trình piston S"
              symbol="S"
              unit="mm"
              value={params.geometry.stroke}
              min={40}
              max={120}
              step={1}
              description="Khoảng cách giữa ĐCT và ĐCD. Bán kính khuỷu r = S / 2"
              onChange={(v) => updateGeometry('stroke', v)}
            />

            <ParameterSlider
              label="Chiều dài thanh truyền L"
              symbol="L"
              unit="mm"
              value={params.geometry.conrodLength}
              min={80}
              max={250}
              step={1}
              description="Khoảng cách tâm đầu nhỏ đến tâm đầu to. Bắt buộc L > r để cơ cấu hoạt động"
              onChange={(v) => updateGeometry('conrodLength', v)}
            />

            <ParameterSlider
              label="Tỷ số nén ε"
              symbol="ε"
              unit=""
              value={params.geometry.compressionRatio}
              min={6}
              max={14}
              step={0.1}
              description="Tỉ số giữa thể tích cực đại (Vc + Vs) và thể tích buồng cháy Vc"
              onChange={(v) => updateGeometry('compressionRatio', v)}
            />

            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-2">
                Các đại lượng hình học tự động tính:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600 dark:text-slate-300">
                <div>
                  Bán kính khuỷu: <strong className="text-slate-900 dark:text-white">{crankRadius} mm</strong>
                </div>
                <div>
                  Diện tích piston A: <strong className="text-slate-900 dark:text-white">{pistonAreaCm2.toFixed(1)} cm²</strong>
                </div>
                <div>
                  Dung tích công tác Vs: <strong className="text-blue-600 dark:text-blue-400">{displacedVolumeCm3.toFixed(1)} cm³</strong>
                </div>
                <div>
                  Thể tích buồng cháy Vc: <strong className="text-slate-900 dark:text-white">{clearanceVolumeCm3.toFixed(1)} cm³</strong>
                </div>
                <div>
                  Tỷ số L / r: <strong className="text-slate-900 dark:text-white">{(params.geometry.conrodLength / crankRadius).toFixed(2)}</strong>
                </div>
                <div>
                  Thể tích tức thời V(θ): <strong className="text-emerald-600 dark:text-emerald-400">{kinematics.cylinderVolume.toFixed(1)} cm³</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'thermo' && (
          <div className="space-y-3.5">
            <ParameterSlider
              label="Tốc độ động cơ N"
              symbol="N"
              unit="vòng/phút"
              value={params.thermo.rpm}
              min={300}
              max={6000}
              step={50}
              description="Tốc độ quay của trục khuỷu. Tốc độ càng cao thì tổn thất lưu lượng nạp/thải càng tăng"
              onChange={(v) => updateThermo('rpm', v)}
            />

            <ParameterSlider
              label="Áp suất đường nạp tuyệt đối"
              symbol="p_in"
              unit="bar"
              value={params.thermo.intakePressure}
              min={0.5}
              max={1.2}
              step={0.05}
              description="Áp suất trong đường ống nạp (< 1.0 bar: động cơ tự nhiên; > 1.0 bar: có tăng áp turbo)"
              onChange={(v) => updateThermo('intakePressure', v)}
            />

            <ParameterSlider
              label="Áp suất đường thải tuyệt đối"
              symbol="p_ex"
              unit="bar"
              value={params.thermo.exhaustPressure}
              min={0.9}
              max={1.5}
              step={0.05}
              description="Áp suất ngược trong đường ống xả do bộ giảm thanh và xúc tác cản trở"
              onChange={(v) => updateThermo('exhaustPressure', v)}
            />

            <ParameterSlider
              label="Nhiệt độ khí nạp T_in"
              symbol="T_in"
              unit="K"
              value={params.thermo.intakeTemp}
              min={280}
              max={350}
              step={1}
              description={`Nhiệt độ hỗn hợp khí nạp trước khi vào xi lanh (${(params.thermo.intakeTemp - 273.15).toFixed(0)} °C)`}
              onChange={(v) => updateThermo('intakeTemp', v)}
            />

            <ParameterSlider
              label="Hệ số nhiệt dung tỉ đối γ"
              symbol="γ"
              unit=""
              value={params.thermo.gamma}
              min={1.25}
              max={1.4}
              step={0.01}
              description="Hệ số số mũ đoạn nhiệt (Cp / Cv) của môi chất khí (thường từ 1.30 đến 1.35 đối với hòa khí)"
              onChange={(v) => updateThermo('gamma', v)}
            />

            <ParameterSlider
              label="Nhiệt lượng cấp riêng cho chu trình lý tưởng"
              symbol="q_in"
              unit="kJ/kg"
              value={params.thermo.heatInput}
              min={500}
              max={2000}
              step={50}
              description="Năng lượng tỏa ra từ quá trình cháy trên một đơn vị khối lượng môi chất"
              onChange={(v) => updateThermo('heatInput', v)}
            />
          </div>
        )}

        {activeTab === 'valves' && (
          <div className="space-y-3.5">
            <ParameterSlider
              label="Góc mở sớm xupáp nạp α"
              symbol="α"
              unit="° trước ĐCT"
              value={params.valves.intakeAdvance}
              min={0}
              max={40}
              step={1}
              description="Mở sớm trước khi piston lên tới ĐCT để lợi dụng quán tính dòng khí nạp đầy buồng cháy"
              onChange={(v) => updateValves('intakeAdvance', v)}
            />

            <ParameterSlider
              label="Góc đóng muộn xupáp nạp β"
              symbol="β"
              unit="° sau ĐCD"
              value={params.valves.intakeLag}
              min={0}
              max={80}
              step={1}
              description="Đóng muộn sau khi piston đã qua ĐCD để tiếp tục nạp theo quán tính dòng khí"
              onChange={(v) => updateValves('intakeLag', v)}
            />

            <ParameterSlider
              label="Góc mở sớm xupáp thải γe"
              symbol="γe"
              unit="° trước ĐCD"
              value={params.valves.exhaustAdvance}
              min={0}
              max={80}
              step={1}
              description="Mở sớm trước khi kết thúc kỳ cháy để giảm áp suất dư, giảm lực cản piston khi đi lên"
              onChange={(v) => updateValves('exhaustAdvance', v)}
            />

            <ParameterSlider
              label="Góc đóng muộn xupáp thải δ"
              symbol="δ"
              unit="° sau ĐCT"
              value={params.valves.exhaustLag}
              min={0}
              max={40}
              step={1}
              description="Đóng muộn sau khi piston qua ĐCT để tận dụng quán tính dòng khí quét sạch khí sót"
              onChange={(v) => updateValves('exhaustLag', v)}
            />

            <div className="p-3 bg-purple-50/70 dark:bg-purple-950/30 rounded-xl border border-purple-200/60 dark:border-purple-800/50 text-xs">
              <span className="font-semibold text-purple-900 dark:text-purple-200 block mb-1.5">
                Đặc trưng pha phối khí:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700 dark:text-slate-300">
                <div>
                  Thời gian mở xupáp nạp: <strong className="text-blue-600 dark:text-blue-400">{180 + params.valves.intakeAdvance + params.valves.intakeLag}°</strong>
                </div>
                <div>
                  Thời gian mở xupáp thải: <strong className="text-purple-600 dark:text-purple-400">{180 + params.valves.exhaustAdvance + params.valves.exhaustLag}°</strong>
                </div>
                <div>
                  Góc trùng điệp (α + δ): <strong className="text-emerald-600 dark:text-emerald-400">{params.valves.intakeAdvance + params.valves.exhaustLag}°</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ignition' && (
          <div className="space-y-3.5">
            <ParameterSlider
              label="Góc đánh lửa sớm"
              symbol="θ_ign"
              unit="° trước ĐCT"
              value={params.ignition.sparkAdvance}
              min={0}
              max={40}
              step={1}
              description="Tia lửa điện bật trước ĐCT để áp suất đạt đỉnh ở góc tối ưu (10-15° sau ĐCT). Đánh lửa quá sớm sẽ gây kích nổ và giảm công suất!"
              onChange={(v) => updateIgnition('sparkAdvance', v)}
            />

            <ParameterSlider
              label="Thời gian cháy theo góc quay"
              symbol="Δθ_b"
              unit="° trục khuỷu"
              value={params.ignition.burnDuration}
              min={20}
              max={60}
              step={1}
              description="Khoảng góc trục khuỷu diễn ra quá trình cháy của hàm Wiebe từ khi bật tia lửa đến khi cháy hết"
              onChange={(v) => updateIgnition('burnDuration', v)}
            />

            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-800/50 text-xs flex items-start gap-2 text-slate-700 dark:text-slate-300">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-800 dark:text-amber-300">
                  Ý nghĩa sư phạm:
                </span>{' '}
                Quá trình cháy trong động cơ thực tế không phải là cấp nhiệt đẳng tích tức thời như lý tưởng.
                Góc đánh lửa sớm phải phù hợp với tốc độ lan tràn màng lửa. Nếu đánh lửa quá sớm (&gt; 30°), piston phải chịu tải cản nén ngược lại, làm giảm công suất hữu ích.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ParameterSliderProps {
  label: string;
  symbol: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  description: string;
  onChange: (val: number) => void;
}

const ParameterSlider: React.FC<ParameterSliderProps> = ({
  label,
  symbol,
  unit,
  value,
  min,
  max,
  step,
  description,
  onChange,
}) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {label} <span className="text-slate-400 font-normal">({symbol})</span>
        </span>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) {
                onChange(Math.min(Math.max(val, min), max));
              }
            }}
            className="w-16 px-1.5 py-0.5 text-right font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
          />
          <span className="text-slate-500 text-[11px] w-14">{unit}</span>
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
      />

      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
        {description}
      </p>
    </div>
  );
};
