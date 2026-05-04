import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    layout("guards/GuestGuard.tsx", [
        route("login", "routes/Login.tsx"),
        route("register", "routes/Register.tsx"),
        route("confirm-register", "routes/ConfirmRegister.tsx"),
    ]),

    layout("guards/DeveloperGuard.tsx", [
        layout("Layout/TopBarLayout.tsx", [
            route("panel", "routes/Panel.tsx"),
            route("new-game", "routes/NewGame.tsx"),
            route("game/:gameId", "routes/Game.tsx"),
        ])
    ]),
] satisfies RouteConfig;