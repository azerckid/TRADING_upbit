import type { Route } from "./+types/home";
import { fetchCryptoPrices, formatPrice, formatChangeRate } from "~/utils/upbit-api";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { CRYPTO_MARKETS } from "~/constants";
import { fetchMultipleCoinInfo } from "~/utils/coingecko-api";
import { useRevalidator } from "react-router";
import { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "~/lib/utils";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "업비트 암호화폐 가격" },
    { name: "description", content: "비트코인, 이더리움 등 주요 암호화폐 실시간 가격 조회" },
  ];
}

export async function loader({ }: Route.LoaderArgs) {
  try {
    console.log("[Home Loader] 가격 정보와 코인 아이콘 정보를 가져오는 중...");

    // 가격 정보와 코인 아이콘 정보를 병렬로 가져옵니다
    const [prices, coinIconMap] = await Promise.all([
      fetchCryptoPrices(),
      (async () => {
        try {
          const coinIds = CRYPTO_MARKETS.map((crypto) => crypto.coinGeckoId);
          console.log("[Home Loader] CoinGecko API 호출 시작:", coinIds);
          const iconMap = await fetchMultipleCoinInfo(coinIds);
          console.log("[Home Loader] CoinGecko API 응답 완료, 아이콘 개수:", iconMap.size);
          return iconMap;
        } catch (error) {
          console.error("[Home Loader] CoinGecko API 호출 실패:", error);
          return new Map();
        }
      })(),
    ]);

    console.log("[Home Loader] 모든 데이터 로드 완료");
    console.log("[Home Loader] 가격 개수:", prices.length);
    console.log("[Home Loader] 아이콘 맵 크기:", coinIconMap.size);

    // Map을 일반 객체로 변환하여 직렬화 가능하게 만듭니다
    const coinIconObject: Record<string, { id: string; name: string; image: { small: string; large: string } }> = {};
    for (const [coinId, coinInfo] of coinIconMap.entries()) {
      coinIconObject[coinId] = coinInfo;
      console.log(`[Home Loader] 아이콘 정보 저장: ${coinId} ->`, coinInfo);
    }

    console.log("[Home Loader] 변환된 아이콘 객체:", coinIconObject);

    return { prices, coinIconMap: coinIconObject };
  } catch (error) {
    console.error("[Home Loader] 가격 정보 조회 실패:", error);
    return { prices: [], coinIconMap: {}, error: "암호화폐 가격을 불러오는데 실패했습니다." };
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const revalidator = useRevalidator();

  // 2분마다 가격 정보 자동 갱신
  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 2 * 60 * 1000); // 2분 = 120,000ms

    return () => clearInterval(interval);
  }, [revalidator]);

  // 매수평균가가 있는 코인이 하나라도 있는지 확인
  const hasAnyAverageBuyPrice = loaderData.prices.some(
    (price) => price.averageBuyPrice !== undefined && price.averageBuyPrice > 0
  );

  // 평가손익이 있는 코인이 하나라도 있는지 확인 (업비트 API에서 제공하는 경우)
  const hasAnyProfitLoss = loaderData.prices.some((price) => {
    return price.profitLoss !== undefined && price.profitLoss !== null;
  });

  // 변동률 기준으로 오름차순 정렬
  const sortedPrices = [...loaderData.prices].sort(
    (a, b) => a.changeRate - b.changeRate
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <SidebarTrigger />
        <h1 className="text-3xl font-bold">암호화폐 가격</h1>
      </div>
      {loaderData.error && (
        <div className="mt-4 text-red-500">{loaderData.error}</div>
      )}
      {loaderData.prices.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          코인 가격 정보가 없습니다.
        </div>
      ) : (
        <div className="max-w-6xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left bg-gray-100">코인명</TableHead>
                <TableHead className="text-center bg-gray-100">마켓</TableHead>
                <TableHead className="text-right bg-gray-100">현재가</TableHead>
                <TableHead className="text-right bg-gray-100">변동률</TableHead>
                {hasAnyAverageBuyPrice && (
                  <TableHead className="text-right bg-gray-100">매수평균가</TableHead>
                )}
                {hasAnyProfitLoss && (
                  <TableHead className="text-right bg-gray-100">평가손익</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPrices.map((price, index) => {
                const isRise = price.change === "RISE";
                const isFall = price.change === "FALL";
                const isEven = price.change === "EVEN";

                const changeColorClass = isRise
                  ? "text-red-500"
                  : isFall
                    ? "text-blue-500"
                    : "text-gray-500";

                const ChangeIcon = isRise ? ArrowUp : isFall ? ArrowDown : Minus;
                const hasAverageBuyPrice =
                  price.averageBuyPrice !== undefined && price.averageBuyPrice > 0;
                const hasProfitLoss = price.profitLoss !== undefined && price.profitLoss !== null;

                const profitLoss = hasProfitLoss ? price.profitLoss! : 0;

                const profitLossColorClass =
                  profitLoss > 0
                    ? "text-red-500"
                    : profitLoss < 0
                      ? "text-blue-500"
                      : "text-gray-500";

                // 코인 아이콘 URL 가져오기
                const cryptoInfo = CRYPTO_MARKETS.find((c) => c.market === price.market);
                const coinIconMap = loaderData.coinIconMap as Record<string, { id: string; name: string; image: { small: string; large: string } }> | undefined;
                const coinIconInfo = cryptoInfo && coinIconMap
                  ? coinIconMap[cryptoInfo.coinGeckoId]
                  : null;
                const coinIconUrl = coinIconInfo?.image?.small || null;

                console.log(`[Home Component] 코인: ${price.name}, 아이콘 URL:`, coinIconUrl);

                const isLastRow = index === sortedPrices.length - 1;

                return (
                  <TableRow key={price.market} className={isLastRow ? "border-b-2 border-gray-300" : ""}>
                    <TableCell className="text-left font-medium">
                      <div className="flex items-center justify-start gap-2">
                        {coinIconUrl && (
                          <img
                            src={coinIconUrl}
                            alt={price.name}
                            className="h-5 w-5 rounded-full"
                            onError={(e) => {
                              console.error(`[Home Component] 이미지 로드 실패: ${coinIconUrl}`);
                              e.currentTarget.style.display = "none";
                            }}
                            onLoad={() => {
                              console.log(`[Home Component] 이미지 로드 성공: ${coinIconUrl}`);
                            }}
                          />
                        )}
                        <span>{price.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{price.market}</TableCell>
                    <TableCell className="text-right">
                      {formatPrice(price.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className={cn(
                          "flex items-center justify-end gap-1",
                          changeColorClass
                        )}
                      >
                        <ChangeIcon className="h-4 w-4" />
                        <span className="font-semibold">
                          {formatChangeRate(price.changeRate)}
                        </span>
                        <span className="text-sm">
                          ({formatPrice(Math.abs(price.changePrice))})
                        </span>
                      </div>
                    </TableCell>
                    {hasAnyAverageBuyPrice && (
                      <TableCell className="text-right">
                        {hasAverageBuyPrice
                          ? formatPrice(price.averageBuyPrice!)
                          : "-"}
                      </TableCell>
                    )}
                    {hasAnyProfitLoss && (
                      <TableCell className="text-right">
                        {hasProfitLoss ? (
                          <span className={cn("font-semibold", profitLossColorClass)}>
                            {formatPrice(profitLoss)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
