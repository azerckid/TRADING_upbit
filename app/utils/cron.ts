/**
 * 간격을 Cron 형식으로 변환합니다
 * @param intervalType - "hours" 또는 "minutes"
 * @param intervalValue - 간격 값 (문자열)
 * @returns Cron 형식 문자열
 * - 분 단위: 매 N분마다 실행 (예: 30분마다)
 * - 시간 단위: 매 N시간마다 실행 (예: 2시간마다)
 */
export function convertToCron(intervalType: string, intervalValue: string): string {
  if (!intervalType || !intervalValue) return "";
  const value = parseInt(intervalValue);
  if (isNaN(value) || value <= 0) return "";

  if (intervalType === "minutes") {
    // 분 단위 간격: */분 * * * *
    return `*/${value} * * * *`;
  } else {
    // 시간 단위 간격: 0 */시간 * * *
    return `0 */${value} * * *`;
  }
}

