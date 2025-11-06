import type { Route } from "./+types/crypto.$market.buy";
import { CRYPTO_MARKETS } from "~/constants";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { fetchCryptoPrices } from "~/utils/upbit-api";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Form, useActionData } from "react-router";
import { convertToCron } from "~/utils/cron";
import { IntervalSelector } from "~/components/interval-selector";
import { TradingSettingsTable } from "~/components/trading-settings-table";

export function meta({ params }: Route.MetaArgs) {
  const cryptoInfo = CRYPTO_MARKETS.find((c) => c.market === params.market);
  const title = cryptoInfo ? `${cryptoInfo.name} 구매` : "구매";
  return [
    { title },
    { name: "description", content: `${title} 페이지` },
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

export async function action({ request, params }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const settingsJson = formData.get("settings");

    if (!settingsJson || typeof settingsJson !== "string") {
      return { error: "설정 데이터가 없습니다." };
    }

    const settings = JSON.parse(settingsJson);

    // TODO: 설정 데이터를 저장하는 로직 구현
    console.log("구매 설정 저장:", {
      market: params.market,
      settings,
    });

    return { success: true, message: "구매 설정이 저장되었습니다." };
  } catch (error) {
    console.error("구매 설정 저장 실패:", error);
    return { error: "구매 설정 저장에 실패했습니다." };
  }
}

interface BuySetting {
  id: string;
  intervalType: "hours" | "minutes";
  intervalValue: string;
  amount: string;
  percentBelow: string;
}

export default function CryptoBuy({ loaderData, params }: Route.ComponentProps) {
  const cryptoInfo = CRYPTO_MARKETS.find((c) => c.market === params.market);
  const [buySettings, setBuySettings] = useState<BuySetting[]>([]);
  const actionData = useActionData<typeof action>();

  const averageBuyPrice = loaderData.price?.averageBuyPrice || 0;

  const addBuySetting = () => {
    const newSetting: BuySetting = {
      id: Date.now().toString(),
      intervalType: "hours",
      intervalValue: "",
      amount: "",
      percentBelow: "",
    };
    setBuySettings([...buySettings, newSetting]);
  };

  const removeBuySetting = (id: string) => {
    setBuySettings(buySettings.filter((setting) => setting.id !== id));
  };

  const updateBuySetting = (id: string, field: keyof BuySetting, value: string) => {
    setBuySettings(
      buySettings.map((setting) =>
        setting.id === id ? { ...setting, [field]: value } : setting
      )
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <SidebarTrigger />
        <h1 className="text-3xl font-bold">
          {cryptoInfo ? `${cryptoInfo.name} 구매 페이지` : "구매 페이지"}
        </h1>
      </div>

      {loaderData.error && (
        <div className="text-center py-8 text-red-500">{loaderData.error}</div>
      )}

      {actionData?.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {actionData.error}
        </div>
      )}

      {actionData?.success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {actionData.message}
        </div>
      )}

      {loaderData.price && (
        <div className="max-w-6xl">
          <div className="bg-card border rounded-lg p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-4">구매 설정</h2>
                {averageBuyPrice > 0 && (
                  <p className="text-sm text-muted-foreground">
                    매수평균가: ₩{averageBuyPrice.toLocaleString()}
                  </p>
                )}
              </div>
              <Button
                type="button"
                onClick={addBuySetting}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                구매 설정 추가
              </Button>
            </div>

            <TradingSettingsTable
              settings={buySettings}
              settingName="구매설정"
              onRemove={removeBuySetting}
              renderThirdColumn={(setting) =>
                setting.amount ? `₩${Number(setting.amount).toLocaleString()}` : "-"
              }
            />

            <Form method="post" className="space-y-6">
              <input
                type="hidden"
                name="settings"
                value={JSON.stringify(
                  buySettings.map((setting) => ({
                    ...setting,
                    cronTime: convertToCron(setting.intervalType, setting.intervalValue),
                  }))
                )}
              />
              {buySettings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  구매 설정이 없습니다. "구매 설정 추가" 버튼을 클릭하여 추가하세요.
                </div>
              ) : (
                buySettings.map((setting, index) => (
                  <div
                    key={setting.id}
                    className="border rounded-lg p-4 space-y-4 bg-muted/30"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">구매 설정 {index + 1}</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBuySetting(setting.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <IntervalSelector
                      intervalType={setting.intervalType}
                      intervalValue={setting.intervalValue}
                      onIntervalTypeChange={(value) =>
                        updateBuySetting(setting.id, "intervalType", value)
                      }
                      onIntervalValueChange={(value) =>
                        updateBuySetting(setting.id, "intervalValue", value)
                      }
                    />

                    <div className="space-y-2">
                      <label className="text-sm font-medium">금액</label>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="0"
                        value={setting.amount}
                        onChange={(e) =>
                          updateBuySetting(setting.id, "amount", e.target.value)
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        구매할 금액을 입력하세요 (원 단위)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        매수평균가 대비 몇 % 낮을 때 구매
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                        value={setting.percentBelow}
                        onChange={(e) =>
                          updateBuySetting(setting.id, "percentBelow", e.target.value)
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        예: 5% 입력 시 매수평균가보다 5% 낮을 때 구매
                      </p>
                    </div>
                  </div>
                ))
              )}

              {buySettings.length > 0 && (
                <Button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white">
                  모든 구매 설정 저장
                </Button>
              )}
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}

