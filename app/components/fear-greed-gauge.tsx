import { cn } from "~/lib/utils";
import type { FearGreedIndex } from "~/utils/fear-greed-api";
import { getFearGreedKoreanDescription, getFearGreedColorClass } from "~/utils/fear-greed-api";

interface FearGreedGaugeProps {
  index: FearGreedIndex;
  className?: string;
}

/**
 * 공포 및 탐욕 지수를 반원형 게이지로 표시하는 컴포넌트
 */
export function FearGreedGauge({ index, className }: FearGreedGaugeProps) {
  const { value, valueClassification } = index;

  // SVG 경로 계산을 위한 상수
  const width = 240;
  const height = 120;
  const centerX = width / 2;
  const centerY = height; // 반원의 중심은 아래쪽
  const radius = 100;
  const strokeWidth = 20;

  // 게이지 각도 계산 (0-100을 0도(왼쪽)에서 180도(오른쪽)로)
  // 0 = 0도 (왼쪽, 탐욕), 100 = 180도 (오른쪽, 공포)
  const angle = (value / 100) * 180;

  // 5개 구간의 색상 (왼쪽에서 오른쪽으로: 초록 -> 연두 -> 노랑 -> 주황 -> 빨강)
  const segments = [
    { start: 0, end: 36, color: "#ef4444" },         // 극단적 탐욕 (0-20)
    { start: 36, end: 72, color: "#f97316" },        // 탐욕 (20-40)
    { start: 72, end: 108, color: "#eab308" },       // 중립 (40-60)
    { start: 108, end: 144, color: "#84cc16" },      // 공포 (60-80)
    { start: 144, end: 180, color: "#22c55e" },      // 극단적 공포 (80-100)
  ];

  // 각 구간의 경로 생성 (반원형, 왼쪽에서 오른쪽으로)
  // 반원형 게이지: 중심이 아래쪽 중앙에 있고, 왼쪽(0도)에서 오른쪽(180도)로 위쪽 반원을 그림
  const createArcPath = (startAngle: number, endAngle: number) => {
    // SVG 좌표계: 0도 = 오른쪽, 90도 = 아래, 180도 = 왼쪽
    // 반원형 게이지: 중심이 아래쪽에 있고, 왼쪽(0도)에서 오른쪽(180도)로 위쪽 반원을 그림
    const startRad = ((180 - startAngle) * Math.PI) / 180;
    const endRad = ((180 - endAngle) * Math.PI) / 180;

    // 중심에서 시작 각도와 끝 각도로의 점 계산
    // 중심은 (centerX, centerY)이고, 반지름은 위쪽으로 향함
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY - radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY - radius * Math.sin(endRad);

    // 큰 호인지 작은 호인지 판단 (180도 반원이므로 항상 큰 호)
    const largeArcFlag = Math.abs(endAngle - startAngle) > 90 ? 1 : 0;

    // sweep-flag: 1 = 시계 방향 (0도에서 180도로 가므로)
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  // 인디케이터 위치 계산
  // angle은 0도(왼쪽)에서 180도(오른쪽)로 가므로, SVG 좌표계로 변환
  const indicatorRad = ((180 - angle) * Math.PI) / 180;
  const indicatorX = centerX + radius * Math.cos(indicatorRad);
  const indicatorY = centerY - radius * Math.sin(indicatorRad);

  // 현재 값에 해당하는 색상 찾기 (각도 기반)
  const currentColor = segments.find((seg) => {
    return angle >= seg.start && angle <= seg.end;
  })?.color || segments[0].color;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* 배경 구간들 */}
        {segments.map((segment, idx) => (
          <path
            key={idx}
            d={createArcPath(segment.start, segment.end)}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={0.3}
          />
        ))}

        {/* 활성 구간 (현재 값까지) */}
        {segments.map((segment, idx) => {
          const segmentStart = segment.start === 0 ? 0 : (segment.start / 180) * 100;
          const segmentEnd = segment.end === 180 ? 100 : (segment.end / 180) * 100;

          if (value >= segmentStart && value <= segmentEnd) {
            // 현재 값이 이 구간에 있으면, 현재 값까지만 그리기
            const activeEnd = angle;
            return (
              <path
                key={`active-${idx}`}
                d={createArcPath(segment.start, activeEnd)}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
            );
          } else if (value > segmentEnd) {
            // 현재 값이 이 구간보다 크면, 전체 구간 그리기
            return (
              <path
                key={`active-${idx}`}
                d={createArcPath(segment.start, segment.end)}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
            );
          }
          return null;
        })}

        {/* 인디케이터 (흰색 원) */}
        <circle
          cx={indicatorX}
          cy={indicatorY}
          r="8"
          fill="white"
          stroke={currentColor}
          strokeWidth="2"
          className="drop-shadow-md"
        />

        {/* 값 표시 (반원 중심) */}
        <text
          x={centerX}
          y={centerY - radius + 80}
          textAnchor="middle"
          className="text-5xl font-bold fill-foreground"
          style={{ fontSize: '48px', fontWeight: 'bold' }}
        >
          {value}
        </text>
        <text
          x={centerX}
          y={centerY - radius + 105}
          textAnchor="middle"
          className="text-xl font-semibold fill-foreground"
          style={{ fontSize: '20px', fontWeight: '600' }}
        >
          {getFearGreedKoreanDescription(valueClassification)}
        </text>
      </svg>
    </div>
  );
}
