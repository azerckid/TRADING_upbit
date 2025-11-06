import { z } from "zod";

/**
 * 업비트 API 응답 검증 스키마
 */

/**
 * 업비트 Ticker 응답 스키마
 */
export const upbitTickerSchema = z.object({
  market: z.string(),
  trade_date: z.string(),
  trade_time: z.string(),
  trade_date_kst: z.string(),
  trade_time_kst: z.string(),
  trade_timestamp: z.number(),
  opening_price: z.number(),
  high_price: z.number(),
  low_price: z.number(),
  trade_price: z.number(),
  prev_closing_price: z.number(),
  change: z.enum(["RISE", "FALL", "EVEN"]),
  change_price: z.number(),
  change_rate: z.number(),
  signed_change_price: z.number(),
  signed_change_rate: z.number(),
  trade_volume: z.number(),
  acc_trade_price: z.number(),
  acc_trade_price_24h: z.number(),
  acc_trade_volume: z.number(),
  acc_trade_volume_24h: z.number(),
  highest_52_week_price: z.number(),
  highest_52_week_date: z.string(),
  lowest_52_week_price: z.number(),
  lowest_52_week_date: z.string(),
  timestamp: z.number(),
});

/**
 * 업비트 계좌 응답 스키마
 */
export const upbitAccountSchema = z.object({
  currency: z.string(),
  balance: z.string(),
  locked: z.string(),
  avg_buy_price: z.string(),
  avg_buy_price_modified: z.boolean(),
  unit_currency: z.string(),
});

/**
 * 거래 규칙 생성/수정 스키마 (향후 사용)
 */
export const tradingRuleSchema = z.object({
  market: z.string().min(1, "마켓을 선택해주세요"),
  sellEnabled: z.boolean().default(false),
  sellIntervalMinutes: z
    .number()
    .min(1, "매도 간격은 최소 1분 이상이어야 합니다")
    .max(1440, "매도 간격은 최대 1440분(24시간)을 초과할 수 없습니다"),
  sellQuantity: z
    .number()
    .min(0.0001, "매도 수량은 최소 0.0001 이상이어야 합니다")
    .positive("매도 수량은 양수여야 합니다"),
  sellPercentThreshold: z
    .number()
    .min(0.01, "매도 임계값은 최소 0.01% 이상이어야 합니다")
    .max(100, "매도 임계값은 최대 100%를 초과할 수 없습니다"),
  buyEnabled: z.boolean().default(false),
  buyIntervalMinutes: z
    .number()
    .min(1, "매수 간격은 최소 1분 이상이어야 합니다")
    .max(1440, "매수 간격은 최대 1440분(24시간)을 초과할 수 없습니다"),
  buyAmount: z
    .number()
    .min(1000, "매수 금액은 최소 1,000원 이상이어야 합니다")
    .positive("매수 금액은 양수여야 합니다"),
  buyPercentThreshold: z
    .number()
    .min(0.01, "매수 임계값은 최소 0.01% 이상이어야 합니다")
    .max(100, "매수 임계값은 최대 100%를 초과할 수 없습니다"),
  enabled: z.boolean().default(false),
});

/**
 * 거래 규칙 업데이트 스키마 (일부 필드만 업데이트 가능)
 */
export const updateTradingRuleSchema = tradingRuleSchema.partial();

/**
 * 거래 규칙 토글 스키마
 */
export const toggleTradingRuleSchema = z.object({
  id: z.string().min(1, "규칙 ID가 필요합니다"),
  enabled: z.boolean(),
});

/**
 * FormData에서 거래 규칙 파싱 헬퍼 함수
 */
export function parseTradingRuleFormData(formData: FormData) {
  return {
    market: formData.get("market") as string,
    sellEnabled: formData.get("sellEnabled") === "true",
    sellIntervalMinutes: Number(formData.get("sellIntervalMinutes")),
    sellQuantity: Number(formData.get("sellQuantity")),
    sellPercentThreshold: Number(formData.get("sellPercentThreshold")),
    buyEnabled: formData.get("buyEnabled") === "true",
    buyIntervalMinutes: Number(formData.get("buyIntervalMinutes")),
    buyAmount: Number(formData.get("buyAmount")),
    buyPercentThreshold: Number(formData.get("buyPercentThreshold")),
    enabled: formData.get("enabled") === "true",
  };
}

/**
 * Zod 에러를 사용자 친화적인 메시지로 변환
 */
export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((err: z.ZodIssue) => {
      const path = err.path.join(".");
      return path ? `${path}: ${err.message}` : err.message;
    })
    .join(", ");
}

