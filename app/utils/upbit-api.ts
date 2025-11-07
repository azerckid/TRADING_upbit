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
 * 업비트 계좌 조회 API에서 매수평균가와 보유수량을 가져옵니다
 */
async function fetchAccountInfo(): Promise<{
  avgBuyPriceMap: Map<string, number>;
  balanceMap: Map<string, number>;
  profitLossMap: Map<string, number>;
  profitLossRateMap: Map<string, number>;
}> {
  const accessKey = process.env.UPBIT_OPEN_API_ACCESS_KEY;
  const secretKey = process.env.UPBIT_OPEN_API_SECRET_KEY;

    // API 키가 없으면 빈 Map 반환
    if (!accessKey || !secretKey) {
      console.warn("업비트 API 키가 설정되지 않아 계좌 정보를 가져올 수 없습니다.");
      return {
        avgBuyPriceMap: new Map(),
        balanceMap: new Map(),
        profitLossMap: new Map(),
        profitLossRateMap: new Map(),
      };
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

    // Map 생성: currency -> avg_buy_price, balance, profit_loss, profit_loss_rate
    const avgBuyPriceMap = new Map<string, number>();
    const balanceMap = new Map<string, number>();
    const profitLossMap = new Map<string, number>();
    const profitLossRateMap = new Map<string, number>();

    accounts.forEach((account) => {
      if (account.currency) {
        // KRW-BTC 형식으로 변환
        const market = `KRW-${account.currency}`;
        
        if (account.avg_buy_price && parseFloat(account.avg_buy_price) > 0) {
          avgBuyPriceMap.set(market, parseFloat(account.avg_buy_price));
        }
        
        if (account.balance && parseFloat(account.balance) > 0) {
          balanceMap.set(market, parseFloat(account.balance));
        }

        // 업비트 API 응답에서 평가손익 관련 필드 확인
        // 가능한 필드명: profit_loss, profit, loss, unrealized_profit, unrealized_loss 등
        const possibleProfitLossFields = [
          'profit_loss',
          'profit',
          'loss',
          'unrealized_profit',
          'unrealized_loss',
          'evaluation_profit',
          'evaluation_loss',
        ];

        for (const field of possibleProfitLossFields) {
          if (account[field] !== undefined && account[field] !== null) {
            const value = typeof account[field] === 'string' 
              ? parseFloat(account[field] as string)
              : Number(account[field]);
            if (!isNaN(value)) {
              profitLossMap.set(market, value);
              break;
            }
          }
        }

        // 업비트 API 응답에서 평가손익 % 관련 필드 확인
        // 가능한 필드명: profit_loss_rate, yield_rate, return_rate, profit_rate, loss_rate 등
        const possibleProfitLossRateFields = [
          'profit_loss_rate',
          'yield_rate',
          'return_rate',
          'profit_rate',
          'loss_rate',
          'evaluation_profit_rate',
          'evaluation_loss_rate',
          'rate',
        ];

        for (const field of possibleProfitLossRateFields) {
          if (account[field] !== undefined && account[field] !== null) {
            const value = typeof account[field] === 'string' 
              ? parseFloat(account[field] as string)
              : Number(account[field]);
            if (!isNaN(value)) {
              profitLossRateMap.set(market, value);
              break;
            }
          }
        }

        // 디버깅: API 응답의 모든 필드 로깅 (처음 한 번만)
        if (accounts.indexOf(account) === 0) {
          console.log('[Upbit API] 계좌 정보 응답 필드:', Object.keys(account));
          console.log('[Upbit API] 계좌 정보 전체 응답:', account);
        }
      }
    });

    return { avgBuyPriceMap, balanceMap, profitLossMap, profitLossRateMap };
  } catch (error) {
    console.error("계좌 정보 조회 실패:", error);
    return {
      avgBuyPriceMap: new Map(),
      balanceMap: new Map(),
      profitLossMap: new Map(),
      profitLossRateMap: new Map(),
    };
  }
}

/**
 * 업비트 API에서 여러 코인의 현재가 정보를 조회합니다
 */
export async function fetchCryptoPrices(): Promise<CryptoPrice[]> {
  const markets = CRYPTO_MARKETS.map((crypto) => crypto.market).join(",");
  const url = `${UPBIT_API_BASE_URL}/ticker?markets=${markets}`;

  try {
    // 현재가 정보와 계좌 정보를 병렬로 가져옵니다
    const [tickersResponse, accountInfo] = await Promise.all([
      fetch(url),
      fetchAccountInfo(),
    ]);

    if (!tickersResponse.ok) {
      throw new Error(`업비트 API 오류: ${tickersResponse.status}`);
    }

    const tickers: UpbitTicker[] = await tickersResponse.json();
    const { avgBuyPriceMap, balanceMap, profitLossMap, profitLossRateMap } = accountInfo;

    // 코인 정보와 매칭하여 변환
    return tickers.map((ticker) => {
      const cryptoInfo = CRYPTO_MARKETS.find(
        (crypto) => crypto.market === ticker.market
      );
      const averageBuyPrice = avgBuyPriceMap.get(ticker.market);
      const balance = balanceMap.get(ticker.market);
      
      // 업비트 API에서 제공하는 평가손익이 있으면 사용, 없으면 계산
      let profitLoss = profitLossMap.get(ticker.market);
      
      // API에서 평가손익이 제공되지 않으면 계산
      if (profitLoss === undefined && averageBuyPrice !== undefined && balance !== undefined) {
        if (averageBuyPrice > 0 && balance > 0) {
          profitLoss = (ticker.trade_price - averageBuyPrice) * balance;
        }
      }

      // 업비트 API에서 제공하는 평가손익 %가 있으면 사용, 없으면 계산
      let profitLossRate = profitLossRateMap.get(ticker.market);
      
      // API에서 평가손익 %가 제공되지 않으면 계산
      if (profitLossRate === undefined && averageBuyPrice !== undefined && averageBuyPrice > 0) {
        if (profitLoss !== undefined && profitLoss !== null) {
          // 평가손익 % = (평가손익 / (매수평균가 × 보유수량)) × 100
          // 또는 더 간단하게: (평가손익 / 매수평균가) × 100 (단위당)
          // 또는: ((현재가 - 매수평균가) / 매수평균가) × 100
          profitLossRate = ((ticker.trade_price - averageBuyPrice) / averageBuyPrice) * 100;
        }
      }

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
        balance: balance,
        profitLoss: profitLoss,
        profitLossRate: profitLossRate,
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

/**
 * 환율을 가져옵니다 (USD/KRW)
 * 실제로는 환율 API를 사용하거나, 주기적으로 업데이트되는 값을 사용해야 합니다
 * 여기서는 간단하게 고정 환율을 사용합니다 (실제로는 API에서 가져와야 함)
 */
export async function getExchangeRate(): Promise<number> {
  try {
    // 간단하게 고정 환율 사용 (실제로는 환율 API를 사용해야 함)
    // 예: https://api.exchangerate-api.com/v4/latest/USD
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    if (response.ok) {
      const data = await response.json();
      return data.rates.KRW || 1300; // 기본값 1300원
    }
    return 1300; // 기본값
  } catch (error) {
    console.error("환율 조회 실패:", error);
    return 1300; // 기본값
  }
}

/**
 * 한국 원화를 미국 달러로 변환합니다
 */
export function convertKRWToUSD(krw: number, exchangeRate: number): number {
  return krw / exchangeRate;
}

/**
 * 가격을 미국 달러 형식으로 포맷팅합니다
 */
export function formatPriceUSD(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(price);
}


