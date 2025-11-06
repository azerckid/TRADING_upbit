import type { Route } from "./+types/crypto.$market.sell";
import { CRYPTO_MARKETS } from "~/constants";
import { SidebarTrigger } from "~/components/ui/sidebar";

export function meta({ params }: Route.MetaArgs) {
  const cryptoInfo = CRYPTO_MARKETS.find((c) => c.market === params.market);
  const title = cryptoInfo ? `${cryptoInfo.name} 판매` : "판매";
  return [
    { title },
    { name: "description", content: `${title} 페이지` },
  ];
}

export default function CryptoSell({ params }: Route.ComponentProps) {
  const cryptoInfo = CRYPTO_MARKETS.find((c) => c.market === params.market);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <SidebarTrigger />
        <h1 className="text-3xl font-bold">
          {cryptoInfo ? `${cryptoInfo.name} 판매 페이지` : "판매 페이지"}
        </h1>
      </div>
    </div>
  );
}

