import type { Route } from "./+types/_layout";
import { useState } from "react";
import { Link, useLocation } from "react-router";
import { CRYPTO_MARKETS } from "~/constants";
import { fetchMultipleCoinInfo } from "~/utils/coingecko-api";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import {
  ChevronRight,
  TrendingUp,
  User,
  Sparkles,
  Check,
  CreditCard,
  Bell,
  LogOut,
  ChevronsUpDown,
} from "lucide-react";
import { Outlet } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export async function loader({ }: Route.LoaderArgs) {
  try {
    console.log("[Layout Loader] 코인 아이콘 정보를 가져오는 중...");

    const coinIds = CRYPTO_MARKETS.map((crypto) => crypto.coinGeckoId);
    console.log("[Layout Loader] CoinGecko API 호출 시작:", coinIds);

    const coinIconMap = await fetchMultipleCoinInfo(coinIds);

    console.log("[Layout Loader] CoinGecko API 응답 완료, 아이콘 개수:", coinIconMap.size);

    // Map을 일반 객체로 변환하여 직렬화 가능하게 만듭니다
    const coinIconObject: Record<string, { id: string; name: string; image: { small: string; large: string } }> = {};
    for (const [coinId, coinInfo] of coinIconMap.entries()) {
      coinIconObject[coinId] = coinInfo;
      console.log(`[Layout Loader] 아이콘 정보 저장: ${coinId} ->`, coinInfo);
    }

    console.log("[Layout Loader] 변환된 아이콘 객체:", coinIconObject);

    return { coinIconMap: coinIconObject };
  } catch (error) {
    console.error("[Layout Loader] CoinGecko API 호출 실패:", error);
    return { coinIconMap: {} };
  }
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());
  const location = useLocation();

  function toggleMenu(market: string) {
    setOpenMenus((prev) => {
      const next = new Set(prev);
      if (next.has(market)) {
        next.delete(market);
      } else {
        next.add(market);
      }
      return next;
    });
  }

  // 현재 경로에서 market 파라미터 추출
  const currentMarket = location.pathname.startsWith("/crypto/")
    ? location.pathname.split("/crypto/")[1]
    : null;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-center gap-4 px-2 py-1.5">
              <img
                src="https://upbit-web-dist.upbit.com/upbit-web/images/upbit_logo.35a5b2a.svg"
                alt="업비트 로고"
                className="h-4 w-auto object-contain"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">업비트 자동거래</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>거래소</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === "/"}>
                      <Link to="/">Total</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === "/dashboard"}>
                      <Link to="/dashboard">Dashboard</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {CRYPTO_MARKETS.map((crypto) => {
                    const isOpen = openMenus.has(crypto.market);
                    const isActive = currentMarket === crypto.market;
                    return (
                      <SidebarMenuItem key={crypto.market}>
                        <div className="flex items-center">
                          <SidebarMenuButton
                            isActive={isActive}
                            asChild
                            className="flex-1"
                          >
                            <Link to={`/crypto/${crypto.market}`} className="flex items-center gap-2">
                              {(() => {
                                const coinIconInfo = loaderData.coinIconMap
                                  ? loaderData.coinIconMap[crypto.coinGeckoId]
                                  : null;
                                const coinIconUrl = coinIconInfo?.image.small || null;

                                console.log(`[Layout Component] 코인: ${crypto.name}, 아이콘 URL:`, coinIconUrl);

                                return coinIconUrl ? (
                                  <img
                                    src={coinIconUrl}
                                    alt={crypto.name}
                                    className="h-4 w-4 rounded-full"
                                    onError={(e) => {
                                      console.error(`[Layout Component] 이미지 로드 실패: ${coinIconUrl}`);
                                      e.currentTarget.style.display = "none";
                                    }}
                                    onLoad={() => {
                                      console.log(`[Layout Component] 이미지 로드 성공: ${coinIconUrl}`);
                                    }}
                                  />
                                ) : null;
                              })()}
                              <span>{crypto.name}</span>
                            </Link>
                          </SidebarMenuButton>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleMenu(crypto.market);
                            }}
                            className="p-1 hover:bg-sidebar-accent rounded"
                            aria-label="Toggle submenu"
                          >
                            <ChevronRight
                              className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""
                                }`}
                            />
                          </button>
                        </div>
                        {isOpen && (
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild>
                                <Link to={`/crypto/${crypto.market}/sell`}>판매</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild>
                                <Link to={`/crypto/${crypto.market}/buy`}>구매</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
                  <Avatar className="h-8 w-8 rounded-full">
                    <AvatarImage src="https://github.com/zizimoos.png" />
                    <AvatarFallback className="bg-muted">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium">사용자</span>
                    <span className="truncate text-xs text-muted-foreground">
                      user@example.com
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5">
                    <Avatar className="h-8 w-8 rounded-full">
                      <AvatarImage src="https://github.com/zizimoos.png" />
                      <AvatarFallback className="bg-muted">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">사용자</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        user@example.com
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Sparkles className="mr-2 h-4 w-4" />
                    <span>Pro로 업그레이드</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Check className="mr-2 h-4 w-4" />
                    <span>계정</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>결제</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="mr-2 h-4 w-4" />
                    <span>알림</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}

