/**
 * 업비트에서 조회할 암호화폐 목록
 * 새로운 코인을 추가하려면 이 배열에 { market: "KRW-코인코드", name: "코인한글명" } 형태로 추가하세요.
 */
export const CRYPTO_MARKETS = [
    { market: "KRW-BTC", name: "비트코인" },
    { market: "KRW-ETH", name: "이더리움" },
    { market: "KRW-NEAR", name: "니어프로토콜" },
    { market: "KRW-DOGE", name: "도지코인" },
    { market: "KRW-SUI", name: "SUI" },
    { market: "KRW-XRP", name: "XRP" },
    { market: "KRW-SHIB", name: "SHIB" },
    { market: "KRW-SOL", name: "SOL" },
] as const;

