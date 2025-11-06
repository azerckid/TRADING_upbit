import type { CryptoPrice } from "~/types/upbit";
import { formatPrice, formatChangeRate } from "~/utils/upbit-api";
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

interface CryptoPriceTableProps {
    price: CryptoPrice;
}

export function CryptoPriceTable({ price }: CryptoPriceTableProps) {
    const isRise = price.change === "RISE";
    const isFall = price.change === "FALL";
    const isEven = price.change === "EVEN";

    const changeColorClass = isRise
        ? "text-red-500"
        : isFall
            ? "text-blue-500"
            : "text-gray-500";

    const ChangeIcon = isRise ? ArrowUp : isFall ? ArrowDown : Minus;
    const hasAverageBuyPrice = price.averageBuyPrice !== undefined && price.averageBuyPrice > 0;
    const hasProfitLoss = price.profitLoss !== undefined && price.profitLoss !== null;

    const profitLoss = hasProfitLoss ? price.profitLoss! : 0;
    const profitLossColorClass =
        profitLoss > 0
            ? "text-red-500"
            : profitLoss < 0
                ? "text-blue-500"
                : "text-gray-500";

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="text-right">코인명</TableHead>
                    <TableHead className="text-right">마켓</TableHead>
                    <TableHead className="text-right">현재가</TableHead>
                    <TableHead className="text-right">변동률</TableHead>
                    {hasAverageBuyPrice && <TableHead className="text-right">매수평균가</TableHead>}
                    {hasProfitLoss && <TableHead className="text-right">평가손익</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell className="text-right font-medium">{price.name}</TableCell>
                    <TableCell className="text-right">{price.market}</TableCell>
                    <TableCell className="text-right">
                        {formatPrice(price.price)}
                    </TableCell>
                    <TableCell className="text-right">
                        <div className={cn("flex items-center justify-end gap-1", changeColorClass)}>
                            <ChangeIcon className="h-4 w-4" />
                            <span className="font-semibold">
                                {formatChangeRate(price.changeRate)}
                            </span>
                            <span className="text-sm">
                                ({formatPrice(Math.abs(price.changePrice))})
                            </span>
                        </div>
                    </TableCell>
                    {hasAverageBuyPrice && (
                        <TableCell className="text-right">
                            {formatPrice(price.averageBuyPrice!)}
                        </TableCell>
                    )}
                    {hasProfitLoss && (
                        <TableCell className="text-right">
                            <span className={cn("font-semibold", profitLossColorClass)}>
                                {formatPrice(profitLoss)}
                            </span>
                        </TableCell>
                    )}
                </TableRow>
            </TableBody>
        </Table>
    );
}

