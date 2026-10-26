import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { EngineParameters, StrokeType, ViewOptions } from './types/engine';
import { DEFAULT_PARAMETERS, STROKES_CONFIG } from './physics/constants';
import { computeKinematics } from './physics/kinematics';
import { getThermodynamicResults } from './physics/thermodynamics';

import { Header } from './components/Header';
import { StatusBanner } from './components/StatusBanner';
import { ControlBar } from './components/ControlBar';
import { EngineView } from './components/EngineView';
import { PVDiagram } from './components/PVDiagram';
import { ValveTimingDiagram } from './components/ValveTimingDiagram';
import { ParametersPanel } from './components/ParametersPanel';
import { LearningMode } from './components/LearningMode';
import { CalculatedResults } from './components/CalculatedResults';

export const App: React.FC = () => {
  // 1. Quản lý trạng thái giao diện Sáng / Tối
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ice_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('ice_dark_mode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // 2. Quản lý tham số động cơ (Lưu trữ và phục hồi từ LocalStorage)
  const [params, setParams] = useState<EngineParameters>(() => {
    try {
      const saved = localStorage.getItem('ice_params');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_PARAMETERS;
  });

  useEffect(() => {
    localStorage.setItem('ice_params', JSON.stringify(params));
  }, [params]);

  // 3. Trạng thái mô phỏng chung (Shared simulation state)
  const [theta, setTheta] = useState<number>(0); // 0 đến 720 độ
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.15); // tốc độ phát mô phỏng

  // 4. Chế độ mô hình chu trình nhiệt động: 'otto' | 'realistic'
  const [modelType, setModelType] = useState<'otto' | 'realistic'>('realistic');

  // 5. Chế độ học tập: 'observation' | 'strokes'
  const [learningMode, setLearningMode] = useState<'observation' | 'strokes'>('observation');

  // 6. Tùy chọn hiển thị chi tiết hình ảnh 2D
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    showLabels: true,
    showGasArrows: true,
    showDCPoints: true,
    showCrankTrace: true,
    showFullCycleCurve: true,
  });

  // 7. Tính toán động học & nhiệt động học đồng bộ tại góc theta
  const kinematics = useMemo(() => {
    return computeKinematics(theta, params);
  }, [theta, params]);

  const thermoResults = useMemo(() => {
    return getThermodynamicResults(params, modelType, theta);
  }, [params, modelType, theta]);

  // 8. Vòng lặp mô phỏng animation thời gian thực (requestAnimationFrame)
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let animId: number;

    const animate = (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }
      const dt = (time - lastTimeRef.current) / 1000; // giây
      lastTimeRef.current = time;

      if (isPlaying) {
        // Tốc độ góc (độ/giây) = 360 độ * (N vòng/phút / 60) * playbackSpeed
        // Hoặc tốc độ quan sát trực tiếp:
        const angularVelocity = 360 * playbackSpeed * 2.5; // độ/giây
        setTheta((prev) => (prev + angularVelocity * dt) % 720);
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      lastTimeRef.current = null;
    };
  }, [isPlaying, playbackSpeed]);

  // 9. Điều khiển phím tắt (Space: Play/Pause, Mũi tên: Từng bước, R: Reset)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu người dùng đang nhập trong input box
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        const step = e.shiftKey ? 5 : 1;
        setTheta((prev) => (prev - step + 720) % 720);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        const step = e.shiftKey ? 5 : 1;
        setTheta((prev) => (prev + step) % 720);
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        setTheta(0);
        setIsPlaying(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 10. Chuyển đến kỳ cụ thể trong chế độ học tập
  const handleSelectStroke = useCallback((stroke: StrokeType) => {
    setIsPlaying(false);
    switch (stroke) {
      case 'intake':
        setTheta(90); // giữa kỳ nạp
        break;
      case 'compression':
        setTheta(270); // giữa kỳ nén
        break;
      case 'combustion':
        setTheta(450); // giữa kỳ cháy - giãn nở
        break;
      case 'exhaust':
        setTheta(630); // giữa kỳ thải
        break;
    }
  }, []);

  // 11. Áp dụng phối khí lý thuyết (α = β = γe = δ = 0)
  const handleSetTheoreticalTiming = useCallback(() => {
    setParams((prev) => ({
      ...prev,
      valves: {
        intakeAdvance: 0,
        intakeLag: 0,
        exhaustAdvance: 0,
        exhaustLag: 0,
      },
    }));
  }, []);

  const isTheoretical =
    params.valves.intakeAdvance === 0 &&
    params.valves.intakeLag === 0 &&
    params.valves.exhaustAdvance === 0 &&
    params.valves.exhaustLag === 0;

  // 12. Xuất dữ liệu chu trình 720° ra file CSV
  const handleExportCsv = useCallback(() => {
    const rows = [
      [
        'Goc_truc_khuyu_deg',
        'Ky_danh_nghia',
        'The_tich_cm3',
        'Ap_suat_bar',
        'Nhiet_do_K',
        'Vi_tri_piston_mm',
        'Nang_xupap_nap_mm',
        'Nang_xupap_thai_mm',
      ],
    ];

    for (let deg = 0; deg <= 720; deg++) {
      const kine = computeKinematics(deg, params);
      const pt = thermoResults.cyclePoints[deg] || thermoResults.cyclePoints[0];
      rows.push([
        deg.toString(),
        kine.strokeName,
        pt.volume.toFixed(2),
        pt.pressure.toFixed(3),
        pt.temp.toFixed(1),
        kine.pistonDisplacement.toFixed(2),
        kine.intakeValve.liftMm.toFixed(2),
        kine.exhaustValve.liftMm.toFixed(2),
      ]);
    }

    const csvContent = '\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mo_phong_dong_co_4_ky_${modelType}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [params, thermoResults.cyclePoints, modelType]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col">
      {/* 1. Header & Thanh công cụ chung */}
      <Header
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((d) => !d)}
        viewOptions={viewOptions}
        onViewOptionsChange={setViewOptions}
        onApplyPreset={(p) => setParams(p)}
        onExportCsv={handleExportCsv}
      />

      {/* Nội dung ứng dụng chính */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 space-y-4">
        {/* 2. Thanh hiển thị liên tục các trạng thái động cơ (Status Banner) */}
        <StatusBanner kinematics={kinematics} thermo={thermoResults} />

        {/* 3. Thanh điều khiển phát mô phỏng chung (Control Bar) */}
        <ControlBar
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((p) => !p)}
          onResetAngle={() => {
            setTheta(0);
            setIsPlaying(false);
          }}
          theta={theta}
          onAngleChange={(ang) => setTheta(ang)}
          playbackSpeed={playbackSpeed}
          onPlaybackSpeedChange={(spd) => setPlaybackSpeed(spd)}
          engineRpm={params.thermo.rpm}
          onResetDefaults={() => setParams(DEFAULT_PARAMETERS)}
          onSetTheoreticalTiming={handleSetTheoreticalTiming}
          params={params}
        />

        {/* 4. BA KHU VỰC QUAN SÁT CHÍNH (Đồng bộ chung trạng thái):
            - Khu vực 1: Mô hình cơ cấu động cơ 2D
            - Khu vực 2: Đồ thị công p-V
            - Khu vực 3: Đồ thị tròn phối khí 720°
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Cột trái: Mô hình động cơ 2D chuyển động (Chiếm 5 cột trên desktop) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white text-base">
                1. Cơ cấu động cơ 2D
              </span>
              <span
                className="text-xs px-2.5 py-0.5 rounded-full font-bold text-white shadow-xs"
                style={{ backgroundColor: STROKES_CONFIG[kinematics.strokeType].color }}
              >
                {kinematics.strokeName}
              </span>
            </div>

            <EngineView
              params={params}
              kinematics={kinematics}
              viewOptions={viewOptions}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Cột phải: Đồ thị p-V và Đồ thị tròn phối khí (Chiếm 7 cột trên desktop) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Khu vực 2: Đồ thị công p-V */}
            <PVDiagram
              params={params}
              kinematics={kinematics}
              thermoResults={thermoResults}
              modelType={modelType}
              onModelTypeChange={setModelType}
              isDarkMode={isDarkMode}
            />

            {/* Khu vực 3: Đồ thị tròn phối khí 720° */}
            <ValveTimingDiagram
              params={params}
              kinematics={kinematics}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        {/* 5. Chế độ học tập & Giảng dạy từng kỳ */}
        <LearningMode
          learningMode={learningMode}
          onLearningModeChange={setLearningMode}
          activeStroke={kinematics.strokeType}
          onSelectStroke={handleSelectStroke}
          onSetTheoreticalTiming={handleSetTheoreticalTiming}
          isTheoretical={isTheoretical}
        />

        {/* 6. Bảng kết quả nhiệt động & công suất */}
        <CalculatedResults
          params={params}
          kinematics={kinematics}
          thermo={thermoResults}
          modelType={modelType}
        />

        {/* 7. Bảng điều chỉnh tham số chi tiết (Hình học, Vận hành, Phối khí, Đánh lửa) */}
        <ParametersPanel
          params={params}
          onChange={setParams}
          kinematics={kinematics}
          onResetDefaults={() => setParams(DEFAULT_PARAMETERS)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Ứng dụng Mô Phỏng Động Cơ Đốt Trong 4 Kỳ (4-Stroke ICE Simulator)</span>
          <span>Phát triển bằng React, TypeScript, SVG & Vite — Hoạt động 100% trên trình duyệt</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
