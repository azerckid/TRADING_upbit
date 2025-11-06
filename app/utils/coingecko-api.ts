/**
 * CoinGecko API를 사용하여 코인 정보를 가져옵니다
 */

const COINGECKO_API_BASE_URL = "https://api.coingecko.com/api/v3";

/**
 * CoinGecko API에서 코인 정보를 가져옵니다
 * @param coinId CoinGecko 코인 ID (예: "bitcoin", "ethereum")
 * @returns 코인 정보 (이미지 URL 포함)
 */
export async function fetchCoinInfo(coinId: string): Promise<{
  id: string;
  name: string;
  image: {
    small: string;
    large: string;
    thumb?: string;
  };
} | null> {
  try {
    console.log(`[CoinGecko API] 코인 정보 요청: ${coinId}`);
    
    const url = `${COINGECKO_API_BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`;
    
    console.log(`[CoinGecko API] 요청 URL: ${url}`);
    
    const response = await fetch(url);
    
    console.log(`[CoinGecko API] 응답 상태: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.error(`[CoinGecko API] 오류: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    console.log(`[CoinGecko API] 응답 데이터 전체:`, JSON.stringify(data, null, 2));
    console.log(`[CoinGecko API] 이미지 필드 확인:`, {
      image: data.image,
      image_small: data.image?.small,
      image_large: data.image?.large,
      image_thumb: data.image?.thumb,
      image_other: Object.keys(data.image || {}),
    });
    
    if (!data.image) {
      console.warn(`[CoinGecko API] 이미지 정보가 없습니다: ${coinId}`);
      return null;
    }
    
    // 이미지 객체의 모든 필드 확인
    const imageFields = typeof data.image === 'object' ? Object.keys(data.image) : [];
    console.log(`[CoinGecko API] 사용 가능한 이미지 필드:`, imageFields);
    
    return {
      id: data.id,
      name: data.name,
      image: {
        small: data.image.small || data.image.thumb || data.image,
        large: data.image.large || data.image,
      },
    };
  } catch (error) {
    console.error(`[CoinGecko API] 코인 정보 조회 실패 (${coinId}):`, error);
    return null;
  }
}

/**
 * 여러 코인의 정보를 한 번에 가져옵니다
 * @param coinIds CoinGecko 코인 ID 배열
 * @returns 코인 ID를 키로 하는 맵
 */
export async function fetchMultipleCoinInfo(
  coinIds: string[]
): Promise<Map<string, { id: string; name: string; image: { small: string; large: string } }>> {
  try {
    console.log(`[CoinGecko API] 여러 코인 정보 요청:`, coinIds);
    
    const ids = coinIds.join(",");
    const url = `${COINGECKO_API_BASE_URL}/coins/markets?vs_currency=krw&ids=${ids}&sparkline=false`;
    
    console.log(`[CoinGecko API] 요청 URL: ${url}`);
    
    const response = await fetch(url);
    
    console.log(`[CoinGecko API] 응답 상태: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`CoinGecko API 오류: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("[CoinGecko API] 응답 데이터:", data);
    
    const coinInfoMap = new Map<string, { id: string; name: string; image: { small: string; large: string } }>();
    
    for (const coin of data) {
      if (coin.image) {
        console.log(`[CoinGecko API] 코인 정보 저장:`, {
          id: coin.id,
          name: coin.name,
          image: coin.image,
        });
        
        coinInfoMap.set(coin.id, {
          id: coin.id,
          name: coin.name,
          image: {
            small: coin.image,
            large: coin.image,
          },
        });
      } else {
        console.warn(`[CoinGecko API] 이미지 정보가 없습니다: ${coin.id}`);
      }
    }
    
    console.log(`[CoinGecko API] 아이콘 맵 생성 완료, 개수:`, coinInfoMap.size);
    return coinInfoMap;
  } catch (error) {
    console.error("[CoinGecko API] 코인 정보 조회 실패:", error);
    return new Map();
  }
}

/**
 * 코인 아이콘 URL을 가져옵니다 (캐시 지원)
 */
const coinIconCache = new Map<string, string>();

export async function getCoinIconUrl(coinId: string, size: "small" | "large" = "small"): Promise<string | null> {
  // 캐시 확인
  const cacheKey = `${coinId}-${size}`;
  if (coinIconCache.has(cacheKey)) {
    const cachedUrl = coinIconCache.get(cacheKey)!;
    console.log(`[CoinGecko API] 캐시에서 아이콘 URL 가져옴: ${coinId} -> ${cachedUrl}`);
    return cachedUrl;
  }
  
  // API 호출
  const coinInfo = await fetchCoinInfo(coinId);
  
  if (!coinInfo) {
    console.warn(`[CoinGecko API] 코인 정보를 가져올 수 없습니다: ${coinId}`);
    return null;
  }
  
  const iconUrl = coinInfo.image[size];
  
  if (!iconUrl) {
    console.warn(`[CoinGecko API] 아이콘 URL이 없습니다: ${coinId}`);
    return null;
  }
  
  // 캐시에 저장
  coinIconCache.set(cacheKey, iconUrl);
  console.log(`[CoinGecko API] 아이콘 URL 저장: ${coinId} -> ${iconUrl}`);
  
  return iconUrl;
}

