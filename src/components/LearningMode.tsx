import React from 'react';
import type { StrokeType } from '../types/engine';
import { STROKES_CONFIG } from '../physics/constants';
import { BookOpen, Eye, HelpCircle } from 'lucide-react';

interface LearningModeProps {
  learningMode: 'observation' | 'strokes';
  onLearningModeChange: (mode: 'observation' | 'strokes') => void;
  activeStroke: StrokeType;
  onSelectStroke: (stroke: StrokeType) => void;
  onSetTheoreticalTiming: () => void;
  isTheoretical: boolean;
}

export const LearningMode: React.FC<LearningModeProps> = ({
  learningMode,
  onLearningModeChange,
  activeStroke,
  onSelectStroke,
  onSetTheoreticalTiming,
  isTheoretical,
}) => {
  const strokePedagogy: Record<
    StrokeType,
    {
      pistonDirection: string;
      valveState: string;
      gasFlow: string;
      pvTrend: string;
      workDirection: string;
      summaryNote: string;
    }
  > = {
    intake: {
      pistonDirection: 'Đi xuống (từ ĐCT đến ĐCD)',
      valveState: 'Xupáp nạp MỞ, Xupáp thải ĐÓNG',
      gasFlow: 'Không khí hòa trộn nhiên liệu mới được hút vào xi lanh',
      pvTrend: 'Thể tích V tăng từ Vc lên Vmax, Áp suất p thấp hơn khí quyển (hút chân không)',
      workDirection: 'Môi chất nhận công cơ học từ quán tính trục khuỷu kéo piston xuống',
      summaryNote:
        'Thực tế xupáp nạp mở sớm (α) trước ĐCT và đóng muộn (β) sau ĐCD để tận dụng quán tính dòng khí nạp đầy hơn.',
    },
    compression: {
      pistonDirection: 'Đi lên (từ ĐCD lên ĐCT)',
      valveState: 'CẢ HAI XUPÁP ĐỀU ĐÓNG kín buồng cháy',
      gasFlow: 'Không có dòng khí lưu thông (hệ nhiệt động kín)',
      pvTrend: 'Thể tích V giảm từ Vmax về Vc, Áp suất p và Nhiệt độ T tăng mạnh',
      workDirection: 'Piston thực hiện công nén lên khối khí (công tiêu tốn W < 0)',
      summaryNote:
        'Cuối kỳ nén, bugi bật tia lửa điện trước ĐCT (góc đánh lửa sớm) để chuẩn bị cho quá trình cháy hoàn toàn.',
    },
    combustion: {
      pistonDirection: 'Đi xuống (từ ĐCT xuống ĐCD)',
      valveState: 'CẢ HAI XUPÁP ĐỀU ĐÓNG (đến gần cuối kỳ thì xupáp thải mở sớm γe)',
      gasFlow: 'Khí cháy bùng nổ, áp suất cực đại đẩy mạnh lên đỉnh piston',
      pvTrend: 'Áp suất p đạt đỉnh Pmax rồi giảm dần khi V tăng từ Vc lên Vmax',
      workDirection: 'Môi chất khí giãn nở sinh công hữu ích đẩy piston (kỳ sinh công duy nhất W > 0)',
      summaryNote:
        'Đây là kỳ sinh công duy nhất trong chu trình 4 kỳ cung cấp năng lượng để duy trì 3 kỳ còn lại và truyền ra trục khuỷu.',
    },
    exhaust: {
      pistonDirection: 'Đi lên (từ ĐCD lên ĐCT)',
      valveState: 'Xupáp thải MỞ, Xupáp nạp ĐÓNG (đến sát ĐCT thì xupáp nạp mở sớm)',
      gasFlow: 'Khí xả và cặn sản phẩm cháy bị đẩy mạnh ra ngoài ống xả',
      pvTrend: 'Thể tích V giảm từ Vmax về Vc, Áp suất p cao hơn áp suất khí quyển',
      workDirection: 'Piston thực hiện công đẩy khí thải ra ngoài (công bơm tổn thất)',
      summaryNote:
        'Xupáp thải đóng muộn (δ) sau ĐCT tạo ra vùng trùng điệp xupáp (α + δ) nơi cả 2 xupáp cùng mở để quét sạch buồng cháy.',
    },
  };

  const currentInfo = strokePedagogy[activeStroke];
  const strokeConfig = STROKES_CONFIG[activeStroke];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-all duration-200">
      {/* Header chế độ học tập */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Chế độ học tập & Giảng dạy
          </h3>
        </div>

        {/* Chuyển đổi giữa 2 chế độ */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => onLearningModeChange('observation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              learningMode === 'observation'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quan sát liên tục</span>
          </button>
          <button
            onClick={() => onLearningModeChange('strokes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              learningMode === 'strokes'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Tìm hiểu từng kỳ</span>
          </button>
        </div>
      </div>

      {/* 4 Thẻ chọn kỳ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {(['intake', 'compression', 'combustion', 'exhaust'] as StrokeType[]).map((st) => {
          const cfg = STROKES_CONFIG[st];
          const isSelected = activeStroke === st && learningMode === 'strokes';

          return (
            <button
              key={st}
              onClick={() => {
                onLearningModeChange('strokes');
                onSelectStroke(st);
              }}
              className={`flex flex-col text-left p-2.5 rounded-xl border transition-all ${
                isSelected
                  ? 'ring-2 ring-blue-600 shadow-sm border-transparent'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
              style={{
                backgroundColor: isSelected ? cfg.lightBg : undefined,
              }}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: cfg.color }}
                ></span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {cfg.name.split(':')[1]?.trim() || cfg.name}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                {cfg.nominalAngleRange[0]}° – {cfg.nominalAngleRange[1]}°
              </span>
            </button>
          );
        })}
      </div>

      {/* Khối giải thích chi tiết khi chọn từng kỳ */}
      <div
        className="p-4 rounded-xl border text-xs space-y-2.5 transition-all"
        style={{
          backgroundColor: strokeConfig.lightBg,
          borderColor: `${strokeConfig.color}40`,
        }}
      >
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/50 dark:border-slate-700/50">
          <span className="text-sm font-bold" style={{ color: strokeConfig.color }}>
            {strokeConfig.name}
          </span>
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
            Khoảng góc danh nghĩa: {strokeConfig.nominalAngleRange[0]}° – {strokeConfig.nominalAngleRange[1]}°
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-slate-700 dark:text-slate-300">
          <div className="flex items-start gap-2">
            <span className="font-semibold text-slate-900 dark:text-white shrink-0">
              1. Chuyển động Piston:
            </span>
            <span>{currentInfo.pistonDirection}</span>
          </div>

          <div className="flex items-start gap-2">
            <span className="font-semibold text-slate-900 dark:text-white shrink-0">
              2. Trạng thái xupáp:
            </span>
            <span>{currentInfo.valveState}</span>
          </div>

          <div className="flex items-start gap-2">
            <span className="font-semibold text-slate-900 dark:text-white shrink-0">
              3. Chiều dòng khí:
            </span>
            <span>{currentInfo.gasFlow}</span>
          </div>

          <div className="flex items-start gap-2">
            <span className="font-semibold text-slate-900 dark:text-white shrink-0">
              4. Biến đổi p và V:
            </span>
            <span>{currentInfo.pvTrend}</span>
          </div>

          <div className="flex items-start gap-2 sm:col-span-2">
            <span className="font-semibold text-slate-900 dark:text-white shrink-0">
              5. Bản chất công:
            </span>
            <span className="font-medium text-blue-700 dark:text-blue-300">
              {currentInfo.workDirection}
            </span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-[11px] text-slate-600 dark:text-slate-400 italic flex items-start gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" />
          <span>{currentInfo.summaryNote}</span>
        </div>
      </div>

      {/* So sánh phối khí lý thuyết vs thực tế */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="text-slate-600 dark:text-slate-400 max-w-lg">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            So sánh phối khí lý thuyết:
          </span>{' '}
          Khi đặt các góc phối khí <strong className="text-slate-800 dark:text-slate-200">α = β = γe = δ = 0°</strong>,
          mỗi xupáp mở đúng 180° theo đúng hành trình piston, không có góc mở sớm / đóng muộn và không có vùng trùng điệp.
        </div>

        <button
          onClick={onSetTheoreticalTiming}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
            isTheoretical
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {isTheoretical ? '✓ Đang ở Phối khí lý thuyết (0°)' : 'Áp dụng Phối khí lý thuyết (0°)'}
        </button>
      </div>
    </div>
  );
};
