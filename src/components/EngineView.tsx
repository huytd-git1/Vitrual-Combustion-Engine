import React, { useMemo } from 'react';
import type { EngineKinematicsState, EngineParameters, ViewOptions } from '../types/engine';

interface EngineViewProps {
  params: EngineParameters;
  kinematics: EngineKinematicsState;
  viewOptions: ViewOptions;
  isDarkMode: boolean;
}

export const EngineView: React.FC<EngineViewProps> = ({
  params,
  kinematics,
  viewOptions,
  isDarkMode,
}) => {
  // Tọa độ gốc SVG: 460 x 580
  const svgWidth = 460;
  const svgHeight = 580;
  const x0 = svgWidth / 2; // 230: trục xi lanh
  const y0 = 440; // tâm trục khuỷu

  // Tỉ lệ hiển thị (pixels / mm)
  const scale = 1.35;
  const r = kinematics.crankRadius * scale;
  const L = kinematics.safeConrodLength * scale;
  const D = params.geometry.bore * scale;
  const S = params.geometry.stroke * scale;

  // Chiều cao buồng cháy Vc tương đối trên đồ họa
  const cr = Math.max(params.geometry.compressionRatio, 1.1);
  const clearanceHeight = Math.max(12, S / (cr - 1));

  // Tọa độ chốt khuỷu (Crankpin)
  const crankPinX = x0 + r * Math.sin(kinematics.thetaRad);
  const crankPinY = y0 - r * Math.cos(kinematics.thetaRad);

  // Tọa độ chốt piston (Wrist pin) dọc theo trục x0
  const dx = crankPinX - x0;
  const term = Math.max(0, L * L - dx * dx);
  const wristPinY = crankPinY - Math.sqrt(term);

  // Kích thước piston
  const pistonHeight = 65;
  const crownY = wristPinY - 26; // đỉnh piston
  const skirtBottomY = crownY + pistonHeight;

  // Đỉnh nắp máy cố định ứng với ĐCT + buồng cháy
  const crownYTdc = y0 - r - L - 26;
  const headBottomY = crownYTdc - clearanceHeight;
  const crownYBdc = crownYTdc + S;

  // Thành xi lanh
  const wallLeft = x0 - D / 2;
  const wallRight = x0 + D / 2;

  // Trạng thái xupáp
  const maxValveLiftPx = 14;
  const intakeLiftPx = kinematics.intakeValve.lift * maxValveLiftPx;
  const exhaustLiftPx = kinematics.exhaustValve.lift * maxValveLiftPx;

  // Tọa độ xupáp
  const intakeValveX = x0 - D * 0.28;
  const exhaustValveX = x0 + D * 0.28;
  const valveGuideY = headBottomY - 45;

  // Màu khí động lực học trong xi lanh
  const gasColorProps = useMemo(() => {
    const stroke = kinematics.strokeType;
    if (stroke === 'intake') {
      return {
        gradId: 'intakeGasGrad',
        fill: 'url(#intakeGasGrad)',
        opacity: 0.85,
      };
    }
    if (stroke === 'compression') {
      return {
        gradId: 'compressionGasGrad',
        fill: 'url(#compressionGasGrad)',
        opacity: 0.9,
      };
    }
    if (stroke === 'combustion') {
      return {
        gradId: 'combustionGasGrad',
        fill: 'url(#combustionGasGrad)',
        opacity: 0.95,
      };
    }
    return {
      gradId: 'exhaustGasGrad',
      fill: 'url(#exhaustGasGrad)',
      opacity: 0.85,
    };
  }, [kinematics.strokeType]);

  // Màu chủ đạo theo theme
  const colors = {
    bg: isDarkMode ? '#0f172a' : '#f8fafc',
    blockOutline: isDarkMode ? '#64748b' : '#334155',
    blockFill: isDarkMode ? '#1e293b' : '#e2e8f0',
    crankshaftColor: isDarkMode ? '#cbd5e1' : '#64748b',
    textColor: isDarkMode ? '#f8fafc' : '#0f172a',
    subTextColor: isDarkMode ? '#94a3b8' : '#64748b',
  };

  return (
    <div className="relative flex flex-col items-center select-none w-full">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full max-w-[500px] h-auto drop-shadow-md rounded-xl transition-colors duration-200"
        style={{ background: colors.bg }}
      >
        <defs>
          <linearGradient id="intakeGasGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.5" />
          </linearGradient>

          <linearGradient id="compressionGasGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ea580c" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0.6" />
          </linearGradient>

          <radialGradient id="combustionGasGrad" cx="50%" cy="15%" r="75%">
            <stop offset="0%" stopColor="#fffbeb" stopOpacity="1" />
            <stop offset="25%" stopColor="#fbbf24" stopOpacity="0.95" />
            <stop offset="65%" stopColor="#ef4444" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#991b1b" stopOpacity="0.8" />
          </radialGradient>

          <linearGradient id="exhaustGasGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#64748b" stopOpacity="0.5" />
          </linearGradient>

          <linearGradient id="pistonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="25%" stopColor="#94a3b8" />
            <stop offset="70%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          <linearGradient id="conrodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="40%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          <linearGradient id="crankGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <filter id="sparkGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <marker id="arrowIntake" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#0284c7" />
          </marker>
          <marker id="arrowExhaust" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#8b5cf6" />
          </marker>
        </defs>

        {/* 1. THÂN MÁY & NẮP MÁY */}
        <g id="engine-block">
          <path
            d={`
              M ${wallLeft - 35} ${headBottomY - 70}
              H ${wallLeft}
              V ${headBottomY}
              V ${crownYBdc + pistonHeight + 20}
              H ${wallLeft - 35}
              Z
            `}
            fill={colors.blockFill}
            stroke={colors.blockOutline}
            strokeWidth="2"
          />
          <path
            d={`
              M ${wallRight + 35} ${headBottomY - 70}
              H ${wallRight}
              V ${headBottomY}
              V ${crownYBdc + pistonHeight + 20}
              H ${wallRight + 35}
              Z
            `}
            fill={colors.blockFill}
            stroke={colors.blockOutline}
            strokeWidth="2"
          />

          <path
            d={`
              M ${wallLeft - 60} ${headBottomY - 50}
              C ${wallLeft - 20} ${headBottomY - 50}, ${intakeValveX - 25} ${headBottomY - 40}, ${intakeValveX - 16} ${headBottomY}
              H ${intakeValveX + 16}
              C ${intakeValveX + 10} ${headBottomY - 25}, ${wallLeft - 10} ${headBottomY - 30}, ${wallLeft - 60} ${headBottomY - 30}
              Z
            `}
            fill={isDarkMode ? '#1e293b' : '#e2e8f0'}
            stroke={colors.blockOutline}
            strokeWidth="1.5"
          />

          <path
            d={`
              M ${wallRight + 60} ${headBottomY - 50}
              C ${wallRight + 20} ${headBottomY - 50}, ${exhaustValveX + 25} ${headBottomY - 40}, ${exhaustValveX + 16} ${headBottomY}
              H ${exhaustValveX - 16}
              C ${exhaustValveX - 10} ${headBottomY - 25}, ${wallRight + 10} ${headBottomY - 30}, ${wallRight + 60} ${headBottomY - 30}
              Z
            `}
            fill={isDarkMode ? '#1e293b' : '#e2e8f0'}
            stroke={colors.blockOutline}
            strokeWidth="1.5"
          />

          <path
            d={`
              M ${wallLeft} ${headBottomY}
              L ${intakeValveX - 14} ${headBottomY}
              L ${intakeValveX + 14} ${headBottomY}
              L ${x0 - 14} ${headBottomY - 6}
              L ${x0 + 14} ${headBottomY - 6}
              L ${exhaustValveX - 14} ${headBottomY}
              L ${exhaustValveX + 14} ${headBottomY}
              L ${wallRight} ${headBottomY}
            `}
            fill="none"
            stroke={colors.blockOutline}
            strokeWidth="2"
          />
        </g>

        {/* 2. MÔI CHẤT KHÍ TRONG XI LANH */}
        <g id="gas-volume">
          <path
            d={`
              M ${wallLeft} ${headBottomY}
              L ${wallRight} ${headBottomY}
              V ${crownY}
              L ${wallLeft} ${crownY}
              Z
            `}
            fill={gasColorProps.fill}
            opacity={gasColorProps.opacity}
            className="transition-all duration-75"
          />
        </g>

        {/* 3. VỆT QUỸ ĐẠO CHỐT KHUỶU */}
        {viewOptions.showCrankTrace && (
          <circle
            cx={x0}
            cy={y0}
            r={r}
            fill="none"
            stroke={isDarkMode ? '#475569' : '#cbd5e1'}
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        )}

        {/* 4. ĐÁNH DẤU ĐCT VÀ ĐCD */}
        {viewOptions.showDCPoints && (
          <g id="dead-center-lines" opacity="0.8">
            <line
              x1={wallLeft - 25}
              y1={crownYTdc}
              x2={wallRight + 25}
              y2={crownYTdc}
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <text
              x={wallRight + 28}
              y={crownYTdc + 4}
              fill="#ef4444"
              fontSize="11"
              fontWeight="bold"
            >
              ĐCT (TDC)
            </text>

            <line
              x1={wallLeft - 25}
              y1={crownYBdc}
              x2={wallRight + 25}
              y2={crownYBdc}
              stroke="#3b82f6"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <text
              x={wallRight + 28}
              y={crownYBdc + 4}
              fill="#3b82f6"
              fontSize="11"
              fontWeight="bold"
            >
              ĐCD (BDC)
            </text>

            <line
              x1={wallLeft - 18}
              y1={crownYTdc}
              x2={wallLeft - 18}
              y2={crownYBdc}
              stroke={colors.textColor}
              strokeWidth="1.5"
            />
            <polyline
              points={`${wallLeft - 22},${crownYTdc + 4} ${wallLeft - 18},${crownYTdc} ${wallLeft - 14},${crownYTdc + 4}`}
              fill="none"
              stroke={colors.textColor}
              strokeWidth="1.5"
            />
            <polyline
              points={`${wallLeft - 22},${crownYBdc - 4} ${wallLeft - 18},${crownYBdc} ${wallLeft - 14},${crownYBdc - 4}`}
              fill="none"
              stroke={colors.textColor}
              strokeWidth="1.5"
            />
            <text
              x={wallLeft - 24}
              y={(crownYTdc + crownYBdc) / 2 + 4}
              fill={colors.textColor}
              fontSize="10"
              fontWeight="600"
              textAnchor="end"
            >
              S = {params.geometry.stroke} mm
            </text>
          </g>
        )}

        {/* 5. CƠ CẤU TRỤC KHUỶU */}
        <g id="crankshaft">
          <circle
            cx={x0}
            cy={y0}
            r="16"
            fill={colors.crankshaftColor}
            stroke={colors.blockOutline}
            strokeWidth="2"
          />
          <circle cx={x0} cy={y0} r="4" fill="#0f172a" />

          <g transform={`rotate(${kinematics.theta}, ${x0}, ${y0})`}>
            <path
              d={`
                M ${x0 - 14} ${y0}
                L ${x0 - 11} ${y0 - r}
                A 14 14 0 0 1 ${x0 + 11} ${y0 - r}
                L ${x0 + 14} ${y0}
                Z
              `}
              fill="url(#crankGrad)"
              stroke={colors.blockOutline}
              strokeWidth="1.5"
            />
            <path
              d={`
                M ${x0 - 16} ${y0 + 5}
                L ${x0 - 32} ${y0 + r * 0.9}
                A ${r * 0.95} ${r * 0.95} 0 0 0 ${x0 + 32} ${y0 + r * 0.9}
                L ${x0 + 16} ${y0 + 5}
                Z
              `}
              fill="url(#crankGrad)"
              stroke={colors.blockOutline}
              strokeWidth="1.5"
            />
          </g>

          <circle
            cx={crankPinX}
            cy={crankPinY}
            r="11"
            fill="#e2e8f0"
            stroke={colors.blockOutline}
            strokeWidth="2"
          />
          <circle cx={crankPinX} cy={crankPinY} r="3" fill="#475569" />
        </g>

        {/* 6. THANH TRUYỀN */}
        <g id="connecting-rod">
          {(() => {
            const rodDx = crankPinX - x0;
            const rodDy = crankPinY - wristPinY;
            const rodAngle = (Math.atan2(rodDy, rodDx) * 180) / Math.PI;

            return (
              <g transform={`translate(${x0}, ${wristPinY}) rotate(${rodAngle - 90})`}>
                <circle cx="0" cy="0" r="14" fill="url(#conrodGrad)" stroke={colors.blockOutline} strokeWidth="1.5" />
                <circle cx="0" cy="0" r="7" fill={colors.bg} />

                <path
                  d={`
                    M -8 12
                    L -6 ${L - 18}
                    H 6
                    L 8 12
                    Z
                  `}
                  fill="url(#conrodGrad)"
                  stroke={colors.blockOutline}
                  strokeWidth="1.5"
                />
                <line x1="0" y1="16" x2="0" y2={L - 22} stroke={colors.blockOutline} strokeWidth="2" />

                <circle cx="0" cy={L} r="18" fill="url(#conrodGrad)" stroke={colors.blockOutline} strokeWidth="1.5" />
                <circle cx="0" cy={L} r="11" fill="none" stroke={colors.blockOutline} strokeWidth="1" />
              </g>
            );
          })()}
        </g>

        {/* 7. PISTON */}
        <g id="piston">
          <path
            d={`
              M ${wallLeft + 1} ${crownY}
              H ${wallRight - 1}
              V ${skirtBottomY}
              H ${wallRight - 12}
              V ${skirtBottomY - 14}
              C ${wallRight - 22} ${skirtBottomY - 14}, ${x0 + 15} ${skirtBottomY - 6}, ${x0} ${skirtBottomY - 6}
              C ${x0 - 15} ${skirtBottomY - 6}, ${wallLeft + 22} ${skirtBottomY - 14}, ${wallLeft + 12} ${skirtBottomY - 14}
              V ${skirtBottomY}
              H ${wallLeft + 1}
              Z
            `}
            fill="url(#pistonGrad)"
            stroke={colors.blockOutline}
            strokeWidth="1.5"
          />

          <rect x={wallLeft + 1} y={crownY + 7} width={D - 2} height="2.5" fill="#334155" />
          <rect x={wallLeft + 1} y={crownY + 13} width={D - 2} height="2.5" fill="#334155" />
          <rect x={wallLeft + 1} y={crownY + 19} width={D - 2} height="2.5" fill="#334155" />

          <circle cx={x0} cy={wristPinY} r="9" fill="#e2e8f0" stroke={colors.blockOutline} strokeWidth="1.5" />
          <circle cx={x0} cy={wristPinY} r="4" fill="#64748b" />
        </g>

        {/* 8. XUPÁP */}
        <g id="intake-valve" transform={`translate(0, ${intakeLiftPx})`}>
          <line
            x1={intakeValveX}
            y1={valveGuideY}
            x2={intakeValveX}
            y2={headBottomY}
            stroke="#94a3b8"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <polygon
            points={`
              ${intakeValveX - 16},${headBottomY + 2}
              ${intakeValveX + 16},${headBottomY + 2}
              ${intakeValveX + 8},${headBottomY - 4}
              ${intakeValveX - 8},${headBottomY - 4}
            `}
            fill="#cbd5e1"
            stroke={colors.blockOutline}
            strokeWidth="1.5"
          />
          <path
            d={`
              M ${intakeValveX - 6} ${valveGuideY}
              L ${intakeValveX + 6} ${valveGuideY + 6}
              L ${intakeValveX - 6} ${valveGuideY + 12}
              L ${intakeValveX + 6} ${valveGuideY + 18}
              L ${intakeValveX - 6} ${valveGuideY + 24}
              L ${intakeValveX + 6} ${valveGuideY + 30}
              L ${intakeValveX} ${valveGuideY + 34}
            `}
            fill="none"
            stroke="#64748b"
            strokeWidth="1.5"
          />
        </g>

        <g id="exhaust-valve" transform={`translate(0, ${exhaustLiftPx})`}>
          <line
            x1={exhaustValveX}
            y1={valveGuideY}
            x2={exhaustValveX}
            y2={headBottomY}
            stroke="#94a3b8"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <polygon
            points={`
              ${exhaustValveX - 16},${headBottomY + 2}
              ${exhaustValveX + 16},${headBottomY + 2}
              ${exhaustValveX + 8},${headBottomY - 4}
              ${exhaustValveX - 8},${headBottomY - 4}
            `}
            fill="#cbd5e1"
            stroke={colors.blockOutline}
            strokeWidth="1.5"
          />
          <path
            d={`
              M ${exhaustValveX - 6} ${valveGuideY}
              L ${exhaustValveX + 6} ${valveGuideY + 6}
              L ${exhaustValveX - 6} ${valveGuideY + 12}
              L ${exhaustValveX + 6} ${valveGuideY + 18}
              L ${exhaustValveX - 6} ${valveGuideY + 24}
              L ${exhaustValveX + 6} ${valveGuideY + 30}
              L ${exhaustValveX} ${valveGuideY + 34}
            `}
            fill="none"
            stroke="#64748b"
            strokeWidth="1.5"
          />
        </g>

        {/* 9. BUGI ĐÁNH LỬA */}
        <g id="spark-plug">
          <rect x={x0 - 5} y={headBottomY - 48} width="10" height="26" fill="#f8fafc" stroke="#64748b" strokeWidth="1" rx="2" />
          <line x1={x0 - 5} y1={headBottomY - 40} x2={x0 + 5} y2={headBottomY - 40} stroke="#cbd5e1" strokeWidth="1" />
          <line x1={x0 - 5} y1={headBottomY - 34} x2={x0 + 5} y2={headBottomY - 34} stroke="#cbd5e1" strokeWidth="1" />
          <rect x={x0 - 6} y={headBottomY - 22} width="12" height="18" fill="#94a3b8" stroke="#334155" strokeWidth="1" />
          <line x1={x0} y1={headBottomY - 4} x2={x0} y2={headBottomY + 4} stroke="#e2e8f0" strokeWidth="2" />
          <path
            d={`
              M ${x0 + 4} ${headBottomY - 4}
              V ${headBottomY + 7}
              H ${x0}
            `}
            fill="none"
            stroke="#64748b"
            strokeWidth="1.5"
          />

          {kinematics.isSparkActive && (
            <g id="spark-effect" filter="url(#sparkGlow)">
              <circle cx={x0} cy={headBottomY + 5} r="14" fill="#fbbf24" opacity="0.8" />
              <circle cx={x0} cy={headBottomY + 5} r="6" fill="#ffffff" />
              <path
                d={`
                  M ${x0 - 2} ${headBottomY + 3}
                  L ${x0 - 8} ${headBottomY + 8}
                  L ${x0 - 3} ${headBottomY + 11}
                  L ${x0 - 10} ${headBottomY + 14}
                `}
                fill="none"
                stroke="#fff"
                strokeWidth="1.5"
              />
              <path
                d={`
                  M ${x0 + 2} ${headBottomY + 3}
                  L ${x0 + 7} ${headBottomY + 7}
                  L ${x0 + 2} ${headBottomY + 10}
                  L ${x0 + 8} ${headBottomY + 15}
                `}
                fill="none"
                stroke="#fff"
                strokeWidth="1.5"
              />
            </g>
          )}
        </g>

        {/* 10. MŨI TÊN DÒNG KHÍ */}
        {viewOptions.showGasArrows && (
          <g id="gas-flow-arrows">
            {kinematics.intakeValve.isOpen && (
              <g opacity={Math.min(kinematics.intakeValve.lift * 1.5, 1)}>
                <path
                  d={`
                    M ${wallLeft - 45} ${headBottomY - 40}
                    C ${wallLeft - 10} ${headBottomY - 40}, ${intakeValveX - 10} ${headBottomY - 20}, ${intakeValveX - 4} ${headBottomY + 15}
                  `}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="3.5"
                  strokeDasharray="6 4"
                  markerEnd="url(#arrowIntake)"
                />
                <path
                  d={`
                    M ${intakeValveX + 8} ${headBottomY + 5}
                    C ${intakeValveX + 15} ${headBottomY + 25}, ${x0 - 5} ${headBottomY + 35}, ${x0} ${headBottomY + 45}
                  `}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="4 3"
                  markerEnd="url(#arrowIntake)"
                />
              </g>
            )}

            {kinematics.exhaustValve.isOpen && (
              <g opacity={Math.min(kinematics.exhaustValve.lift * 1.5, 1)}>
                <path
                  d={`
                    M ${exhaustValveX - 6} ${headBottomY + 18}
                    C ${exhaustValveX} ${headBottomY - 10}, ${wallRight + 5} ${headBottomY - 40}, ${wallRight + 45} ${headBottomY - 40}
                  `}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="3.5"
                  strokeDasharray="6 4"
                  markerEnd="url(#arrowExhaust)"
                />
              </g>
            )}
          </g>
        )}

        {/* 11. NHÃN CHI TIẾT */}
        {viewOptions.showLabels && (
          <g id="part-labels" fontSize="10" fill={colors.subTextColor} fontWeight="500">
            <text x={x0} y={headBottomY - 55} textAnchor="middle" fill="#ef4444" fontWeight="600">
              Bugi đánh lửa
            </text>
            <line x1={x0} y1={headBottomY - 50} x2={x0} y2={headBottomY - 35} stroke="#ef4444" strokeWidth="1" />

            <text x={wallLeft - 45} y={headBottomY - 60} textAnchor="start" fill="#2563eb" fontWeight="600">
              Xupáp nạp
            </text>
            <line x1={wallLeft - 20} y1={headBottomY - 58} x2={intakeValveX} y2={headBottomY - 20} stroke="#2563eb" strokeWidth="1" />

            <text x={wallRight + 45} y={headBottomY - 60} textAnchor="end" fill="#7c3aed" fontWeight="600">
              Xupáp thải
            </text>
            <line x1={wallRight + 20} y1={headBottomY - 58} x2={exhaustValveX} y2={headBottomY - 20} stroke="#7c3aed" strokeWidth="1" />

            <text x={wallLeft - 10} y={crownY - 10} textAnchor="end">
              Xi lanh
            </text>
            <line x1={wallLeft - 8} y1={crownY - 13} x2={wallLeft} y2={crownY - 13} stroke={colors.subTextColor} strokeWidth="1" />

            <text x={wallRight + 12} y={crownY + 25} textAnchor="start">
              Piston
            </text>
            <line x1={wallRight + 10} y1={crownY + 22} x2={wallRight - 4} y2={crownY + 22} stroke={colors.subTextColor} strokeWidth="1" />

            <text x={x0 - 32} y={wristPinY + (crankPinY - wristPinY) / 2} textAnchor="end">
              Thanh truyền
            </text>
            <line
              x1={x0 - 28}
              y1={wristPinY + (crankPinY - wristPinY) / 2 - 3}
              x2={x0 - 6}
              y2={wristPinY + (crankPinY - wristPinY) / 2 - 3}
              stroke={colors.subTextColor}
              strokeWidth="1"
            />

            <text x={x0 + 38} y={y0 + 5} textAnchor="start">
              Trục khuỷu
            </text>
            <line x1={x0 + 35} y1={y0 + 2} x2={x0 + 16} y2={y0 + 2} stroke={colors.subTextColor} strokeWidth="1" />
          </g>
        )}

        {viewOptions.showGasArrows && (
          <text
            x={svgWidth / 2}
            y={svgHeight - 12}
            textAnchor="middle"
            fill={colors.subTextColor}
            fontSize="10"
            fontStyle="italic"
          >
            * Các mũi tên chỉ mang tính chất minh họa chiều dòng khí
          </text>
        )}
      </svg>
    </div>
  );
};
