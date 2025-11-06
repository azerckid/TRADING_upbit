import type { Route } from "./+types/home";
import { fetchCryptoPrices } from "~/utils/upbit-api";
import { CryptoPriceCard } from "~/components/crypto-price-card";

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
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">암호화폐 가격</h1>
      {loaderData.prices.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          코인 가격 정보가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loaderData.prices.map((price) => (
            <CryptoPriceCard key={price.market} price={price} />
          ))}
        </div>
      )}
      {loaderData.error && (
        <div className="mt-4 text-red-500">{loaderData.error}</div>
      )}
    </div>
  );
}
