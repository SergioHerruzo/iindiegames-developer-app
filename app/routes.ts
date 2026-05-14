import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("agreement", "routes/Agreement.tsx"),
    layout("guards/GuestGuard.tsx", [
        route("login", "routes/Login.tsx"),
        route("register", "routes/Register.tsx"),
        route("confirm-register", "routes/ConfirmRegister.tsx"),
    ]),

    layout("guards/DeveloperGuard.tsx", [
        layout("Layout/TopBarLayout.tsx", [
            route("panel", "routes/Panel.tsx"),
            route("new-game", "routes/NewGame.tsx"),
            route("game-details/:gameId", "routes/GameDetails.tsx"),
            route("game-builds/:buildId", "routes/GameBuild.tsx"),
        ])
    ]),
] satisfies RouteConfig;