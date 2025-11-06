import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    layout("routes/_layout.tsx", [
        index("routes/home.tsx"),
        route("dashboard", "routes/dashboard.tsx"),
        route("crypto/:market", "routes/crypto.$market.tsx"),
        route("crypto/:market/sell", "routes/crypto.$market.sell.tsx"),
        route("crypto/:market/buy", "routes/crypto.$market.buy.tsx"),
    ]),
] satisfies RouteConfig;
