import type { CryptoPrice } from "~/types/upbit";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "~/lib/utils";
import { formatPrice, formatChangeRate } from "~/utils/upbit-api";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface CryptoPriceCardProps {
  price: CryptoPrice;
}

export function CryptoPriceCard({ price }: CryptoPriceCardProps) {
  const isRise = price.change === "RISE";
  const isFall = price.change === "FALL";
  const isEven = price.change === "EVEN";

  const changeColorClass = isRise
    ? "text-red-500"
    : isFall
      ? "text-blue-500"
      : "text-gray-500";

  const ChangeIcon = isRise ? ArrowUp : isFall ? ArrowDown : Minus;

  // 매수평균가가 있는 경우에만 표시
  const hasAverageBuyPrice = price.averageBuyPrice !== undefined && price.averageBuyPrice > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{price.name}</CardTitle>
        <div className="text-sm text-muted-foreground">{price.market}</div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">{formatPrice(price.price)}</div>
          <div className={cn("flex items-center gap-1", changeColorClass)}>
            <ChangeIcon className="h-4 w-4" />
            <span className="font-semibold">
              {formatChangeRate(price.changeRate)}
            </span>
            <span className="text-sm">
              ({formatPrice(Math.abs(price.changePrice))})
            </span>
          </div>
          {hasAverageBuyPrice && (
            <div className="pt-2 border-t border-border">
              <div className="text-sm text-muted-foreground">
                매수평균가: {formatPrice(price.averageBuyPrice!)}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

