import type { Route } from "./+types/crypto.$market";
import { fetchCryptoPrices } from "~/utils/upbit-api";
import { CRYPTO_MARKETS } from "~/constants";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { CryptoPriceTable } from "~/components/crypto-price-table";
import { useRevalidator } from "react-router";
import { useEffect } from "react";

export function meta({ params }: Route.MetaArgs) {
    const cryptoInfo = CRYPTO_MARKETS.find((c) => c.market === params.market);
    const title = cryptoInfo ? `${cryptoInfo.name} 정보` : "암호화폐 정보";
    return [
        { title },
        { name: "description", content: `${title} - 업비트 암호화폐 실시간 가격 조회` },
    ];
}

export async function loader({ params }: Route.LoaderArgs) {
    try {
        const prices = await fetchCryptoPrices();
        const marketPrice = prices.find((p) => p.market === params.market);

        if (!marketPrice) {
            return {
                price: null,
                error: "해당 코인 정보를 찾을 수 없습니다.",
            };
        }

        return { price: marketPrice };
    } catch (error) {
        console.error("Failed to fetch crypto price:", error);
        return {
            price: null,
            error: "암호화폐 가격을 불러오는데 실패했습니다.",
        };
    }
}

export default function Crypto({ loaderData, params }: Route.ComponentProps) {
    const revalidator = useRevalidator();
    const cryptoInfo = CRYPTO_MARKETS.find((c) => c.market === params.market);

    // 2분마다 가격 정보 자동 갱신
    useEffect(() => {
        const interval = setInterval(() => {
            revalidator.revalidate();
        }, 2 * 60 * 1000); // 2분 = 120,000ms

        return () => clearInterval(interval);
    }, [revalidator]);

    if (loaderData.error) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="flex items-center gap-4 mb-6">
                    <SidebarTrigger />
                    <h1 className="text-3xl font-bold">
                        {cryptoInfo ? cryptoInfo.name : "암호화폐"} 정보
                    </h1>
                </div>
                <div className="text-center py-8 text-red-500">{loaderData.error}</div>
            </div>
        );
    }

    if (!loaderData.price) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="flex items-center gap-4 mb-6">
                    <SidebarTrigger />
                    <h1 className="text-3xl font-bold">
                        {cryptoInfo ? cryptoInfo.name : "암호화폐"} 정보
                    </h1>
                </div>
                <div className="text-center py-8 text-muted-foreground">
                    코인 가격 정보가 없습니다.
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center gap-4 mb-6">
                <SidebarTrigger />
                <h1 className="text-3xl font-bold">
                    {cryptoInfo ? cryptoInfo.name : "암호화폐"} 정보
                </h1>
            </div>
            <div className="max-w-6xl">
                <CryptoPriceTable price={loaderData.price} />
            </div>
        </div>
    );
}

