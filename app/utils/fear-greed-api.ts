/**
 * Alternative.me의 Crypto Fear & Greed Index API를 사용하여
 * 공포 및 탐욕 지수를 가져옵니다
 */

const FEAR_GREED_API_BASE_URL = "https://api.alternative.me/fng";

export interface FearGreedIndex {
  value: number; // 0-100 사이의 값
  valueClassification: string; // "Extreme Fear", "Fear", "Neutral", "Greed", "Extreme Greed"
  timestamp: number; // Unix timestamp
  timeUntilUpdate?: number; // 다음 업데이트까지 남은 시간 (초)
}

/**
 * 현재 공포 및 탐욕 지수를 가져옵니다
 * @returns 현재 Fear & Greed Index 값
 */
export async function fetchFearGreedIndex(): Promise<FearGreedIndex | null> {
  try {
    console.log("[Fear & Greed API] 공포 및 탐욕 지수 요청 중...");

    const url = `${FEAR_GREED_API_BASE_URL}/`;
    console.log(`[Fear & Greed API] 요청 URL: ${url}`);

    const response = await fetch(url);

    console.log(`[Fear & Greed API] 응답 상태: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Fear & Greed API 오류: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("[Fear & Greed API] 응답 데이터:", data);

    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      console.warn("[Fear & Greed API] 데이터가 없습니다");
      return null;
    }

    const latestData = data.data[0];

    const fearGreedIndex: FearGreedIndex = {
      value: parseInt(latestData.value, 10),
      valueClassification: latestData.value_classification,
      timestamp: parseInt(latestData.timestamp, 10),
      timeUntilUpdate: latestData.time_until_update
        ? parseInt(latestData.time_until_update, 10)
        : undefined,
    };

    console.log("[Fear & Greed API] 공포 및 탐욕 지수:", fearGreedIndex);

    return fearGreedIndex;
  } catch (error) {
    console.error("[Fear & Greed API] 공포 및 탐욕 지수 조회 실패:", error);
    return null;
  }
}

/**
 * 공포 및 탐욕 지수 값에 따른 색상 클래스를 반환합니다
 * @param value 0-100 사이의 값
 * @returns Tailwind CSS 색상 클래스
 */
export function getFearGreedColorClass(value: number): string {
  if (value >= 75) {
    return "text-red-600"; // Extreme Greed
  } else if (value >= 55) {
    return "text-orange-500"; // Greed
  } else if (value >= 45) {
    return "text-yellow-500"; // Neutral
  } else if (value >= 25) {
    return "text-blue-500"; // Fear
  } else {
    return "text-red-800"; // Extreme Fear
  }
}

/**
 * 공포 및 탐욕 지수 값에 따른 SVG fill 색상 클래스를 반환합니다
 * @param value 0-100 사이의 값
 * @returns Tailwind CSS fill 색상 클래스
 */
export function getFearGreedFillColorClass(value: number): string {
  if (value >= 75) {
    return "fill-red-600"; // Extreme Greed
  } else if (value >= 55) {
    return "fill-orange-500"; // Greed
  } else if (value >= 45) {
    return "fill-yellow-500"; // Neutral
  } else if (value >= 25) {
    return "fill-blue-500"; // Fear
  } else {
    return "fill-red-800"; // Extreme Fear
  }
}

/**
 * 공포 및 탐욕 지수 값에 따른 배경 색상 클래스를 반환합니다
 * @param value 0-100 사이의 값
 * @returns Tailwind CSS 배경 색상 클래스
 */
export function getFearGreedBgColorClass(value: number): string {
  if (value >= 75) {
    return "bg-red-100"; // Extreme Greed
  } else if (value >= 55) {
    return "bg-orange-100"; // Greed
  } else if (value >= 45) {
    return "bg-yellow-100"; // Neutral
  } else if (value >= 25) {
    return "bg-blue-100"; // Fear
  } else {
    return "bg-red-200"; // Extreme Fear
  }
}

/**
 * 공포 및 탐욕 지수 값에 따른 hex 색상 값을 반환합니다 (SVG용)
 * @param value 0-100 사이의 값
 * @returns hex 색상 값
 */
export function getFearGreedHexColor(value: number): string {
  if (value >= 75) {
    return "#ef4444"; // Extreme Greed (red-500)
  } else if (value >= 55) {
    return "#f97316"; // Greed (orange-500)
  } else if (value >= 45) {
    return "#eab308"; // Neutral (yellow-500)
  } else if (value >= 25) {
    return "#84cc16"; // Fear (lime-500)
  } else {
    return "#22c55e"; // Extreme Fear (green-500)
  }
}

/**
 * 공포 및 탐욕 지수 구간별 색상 정보를 반환합니다 (게이지용)
 * @returns 구간별 색상 정보 배열
 */
export function getFearGreedSegments(): Array<{ start: number; end: number; color: string }> {
  return [
    { start: 0, end: 36, color: "#ef4444" },    // 극단적 탐욕 (0-20)
    { start: 36, end: 72, color: "#f97316" },   // 탐욕 (20-40)
    { start: 72, end: 108, color: "#eab308" },  // 중립 (40-60)
    { start: 108, end: 144, color: "#84cc16" }, // 공포 (60-80)
    { start: 144, end: 180, color: "#22c55e" }, // 극단적 공포 (80-100)
  ];
}

/**
 * 공포 및 탐욕 지수 값에 따른 한글 설명을 반환합니다
 * @param classification 영문 분류명
 * @returns 한글 설명
 */
export function getFearGreedKoreanDescription(classification: string): string {
  const descriptions: Record<string, string> = {
    "Extreme Fear": "극단적 공포",
    "Fear": "공포",
    "Neutral": "중립",
    "Greed": "탐욕",
    "Extreme Greed": "극단적 탐욕",
  };

  return descriptions[classification] || classification;
}

