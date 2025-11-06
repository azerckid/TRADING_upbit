/**
 * 업비트에서 조회할 암호화폐 목록
 * 새로운 코인을 추가하려면 이 배열에 { market: "KRW-코인코드", name: "코인한글명", coinGeckoId: "coingecko-id" } 형태로 추가하세요.
 */
export const CRYPTO_MARKETS = [
    { market: "KRW-BTC", name: "비트코인", coinGeckoId: "bitcoin" },
    { market: "KRW-ETH", name: "이더리움", coinGeckoId: "ethereum" },
    { market: "KRW-NEAR", name: "니어프로토콜", coinGeckoId: "near" },
    { market: "KRW-DOGE", name: "도지코인", coinGeckoId: "dogecoin" },
    { market: "KRW-SUI", name: "SUI", coinGeckoId: "sui" },
    { market: "KRW-XRP", name: "XRP", coinGeckoId: "ripple" },
    { market: "KRW-SHIB", name: "SHIB", coinGeckoId: "shiba-inu" },
    { market: "KRW-SOL", name: "SOL", coinGeckoId: "solana" },
] as const;

