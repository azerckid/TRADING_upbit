// 업비트 API 응답 타입 정의

export interface UpbitTicker {
  market: string;
  trade_date: string;
  trade_time: string;
  trade_date_kst: string;
  trade_time_kst: string;
  trade_timestamp: number;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  prev_closing_price: number;
  change: "RISE" | "FALL" | "EVEN";
  change_price: number;
  change_rate: number;
  signed_change_price: number;
  signed_change_rate: number;
  trade_volume: number;
  acc_trade_price: number;
  acc_trade_price_24h: number;
  acc_trade_volume: number;
  acc_trade_volume_24h: number;
  highest_52_week_price: number;
  highest_52_week_date: string;
  lowest_52_week_price: number;
  lowest_52_week_date: string;
  timestamp: number;
}

export interface UpbitAccount {
  currency: string; // 예: "BTC", "ETH"
  balance: string;
  locked: string;
  avg_buy_price: string; // 매수평균가
  avg_buy_price_modified: boolean;
  unit_currency: string; // 예: "KRW"
  // 업비트 API 응답에 추가 필드가 있을 수 있으므로 인덱스 시그니처 추가
  [key: string]: unknown;
}

export interface CryptoPrice {
  market: string;
  name: string;
  price: number;
  change: "RISE" | "FALL" | "EVEN";
  changePrice: number;
  changeRate: number;
  tradeVolume: number;
  accTradePrice24h: number;
  averageBuyPrice?: number; // 내가 구매한 매수평균가 (선택사항)
  balance?: number; // 보유수량 (선택사항)
  profitLoss?: number; // 평가손익 (업비트 API에서 제공하는 경우)
}


