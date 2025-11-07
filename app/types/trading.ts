// 거래 설정 관련 타입 정의

/**
 * 실행 간격 타입
 */
export type IntervalType = "hours" | "minutes";

/**
 * 거래 설정 베이스 인터페이스
 */
export interface BaseTradingSetting {
  id: string;
  intervalType: IntervalType;
  intervalValue: string;
  percentValue: string; // +5 또는 -5 형식
}

/**
 * 판매 설정 인터페이스
 */
export interface SellSetting extends BaseTradingSetting {
  coinQuantity: string; // 코인 수량
}

/**
 * 구매 설정 인터페이스
 */
export interface BuySetting extends BaseTradingSetting {
  amount: string; // 구매 금액
}

/**
 * 거래 설정 테이블용 인터페이스 (하위 호환성 유지)
 */
export interface TradingSetting {
  id: string;
  intervalType: IntervalType;
  intervalValue: string;
  percentBelow?: string; // 구매 설정용 (하위 호환성)
  percentValue?: string; // 판매 설정용 (+5 또는 -5 형식)
}

