import type { UpbitTicker, CryptoPrice, UpbitAccount } from "~/types/upbit";
import { CRYPTO_MARKETS } from "~/constants";
import crypto from "crypto";

const UPBIT_API_BASE_URL = "https://api.upbit.com/v1";

/**
 * 업비트 API 인증 JWT 토큰 생성
 */
function generateJWTToken(queryParams: string): string {
  const accessKey = process.env.UPBIT_OPEN_API_ACCESS_KEY;
  const secretKey = process.env.UPBIT_OPEN_API_SECRET_KEY;

  if (!accessKey || !secretKey) {
    throw new Error("UPBIT_OPEN_API_ACCESS_KEY와 UPBIT_OPEN_API_SECRET_KEY 환경 변수가 필요합니다.");
  }

  const payload = {
    access_key: accessKey,
    nonce: new Date().getTime().toString(),
  };

  const queryHash = crypto.createHash("sha512").update(queryParams, "utf-8").digest("hex");

  const jwtPayload = {
    ...payload,
    query_hash: queryHash,
    query_hash_alg: "SHA512",
  };

  // JWT 토큰 생성
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(jwtPayload)).toString("base64url");

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * 업비트 계좌 조회 API에서 매수평균가를 가져옵니다
 */
async function fetchAverageBuyPrices(): Promise<Map<string, number>> {
  const accessKey = process.env.UPBIT_OPEN_API_ACCESS_KEY;
  const secretKey = process.env.UPBIT_OPEN_API_SECRET_KEY;

  // API 키가 없으면 빈 Map 반환
  if (!accessKey || !secretKey) {
    console.warn("업비트 API 키가 설정되지 않아 매수평균가를 가져올 수 없습니다.");
    return new Map();
  }

  try {
    const queryParams = "";
    const token = generateJWTToken(queryParams);

    const response = await fetch(`${UPBIT_API_BASE_URL}/accounts`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`업비트 계좌 조회 API 오류: ${response.status}`);
    }

    const accounts: UpbitAccount[] = await response.json();

    // Map 생성: currency -> avg_buy_price
    const avgBuyPriceMap = new Map<string, number>();

    accounts.forEach((account) => {
      if (account.currency && account.avg_buy_price && parseFloat(account.avg_buy_price) > 0) {
        // KRW-BTC 형식으로 변환
        const market = `KRW-${account.currency}`;
        avgBuyPriceMap.set(market, parseFloat(account.avg_buy_price));
      }
    });

    return avgBuyPriceMap;
  } catch (error) {
    console.error("매수평균가 조회 실패:", error);
    return new Map();
  }
}

/**
 * 업비트 API에서 여러 코인의 현재가 정보를 조회합니다
 */
export async function fetchCryptoPrices(): Promise<CryptoPrice[]> {
  const markets = CRYPTO_MARKETS.map((crypto) => crypto.market).join(",");
  const url = `${UPBIT_API_BASE_URL}/ticker?markets=${markets}`;

  try {
    // 현재가 정보와 매수평균가를 병렬로 가져옵니다
    const [tickersResponse, avgBuyPriceMap] = await Promise.all([
      fetch(url),
      fetchAverageBuyPrices(),
    ]);

    if (!tickersResponse.ok) {
      throw new Error(`업비트 API 오류: ${tickersResponse.status}`);
    }

    const tickers: UpbitTicker[] = await tickersResponse.json();

    // 코인 정보와 매칭하여 변환
    return tickers.map((ticker) => {
      const cryptoInfo = CRYPTO_MARKETS.find(
        (crypto) => crypto.market === ticker.market
      );
      const averageBuyPrice = avgBuyPriceMap.get(ticker.market);

      return {
        market: ticker.market,
        name: cryptoInfo?.name || ticker.market,
        price: ticker.trade_price,
        change: ticker.change,
        changePrice: ticker.signed_change_price,
        changeRate: ticker.change_rate,
        tradeVolume: ticker.trade_volume,
        accTradePrice24h: ticker.acc_trade_price_24h,
        averageBuyPrice: averageBuyPrice,
      };
    });
  } catch (error) {
    console.error("코인 가격 조회 실패:", error);
    throw error;
  }
}

/**
 * 가격을 한국 원화 형식으로 포맷팅합니다
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * 변동률을 퍼센트 형식으로 포맷팅합니다
 */
export function formatChangeRate(rate: number): string {
  const sign = rate >= 0 ? "+" : "";
  return `${sign}${(rate * 100).toFixed(2)}%`;
}

/**
 * 거래대금을 억 단위로 포맷팅합니다
 */
export function formatTradePrice(price: number): string {
  const 억 = price / 100000000;
  return `${억.toFixed(2)}억원`;
}


