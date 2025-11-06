import type { Route } from "./+types/home";
import { fetchCryptoPrices, formatPrice, formatChangeRate } from "~/utils/upbit-api";
import { SidebarTrigger } from "~/components/ui/sidebar";
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
    const prices = await fetchCryptoPrices();
    return { prices };
  } catch (error) {
    console.error("Failed to fetch crypto prices:", error);
    return { prices: [], error: "암호화폐 가격을 불러오는데 실패했습니다." };
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
                <TableHead className="text-center">코인명</TableHead>
                <TableHead className="text-center">마켓</TableHead>
                <TableHead className="text-right">현재가</TableHead>
                <TableHead className="text-right">변동률</TableHead>
                {hasAnyAverageBuyPrice && (
                  <TableHead className="text-right">매수평균가</TableHead>
                )}
                {hasAnyProfitLoss && (
                  <TableHead className="text-right">평가손익</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPrices.map((price) => {
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

                return (
                  <TableRow key={price.market}>
                    <TableCell className="text-center font-medium">
                      {price.name}
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
