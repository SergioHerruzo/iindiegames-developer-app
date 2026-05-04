import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("panel", "routes/Panel.tsx"),
    route("login", "routes/Login.tsx"),
    route("register", "routes/Register.tsx"),
    route("confirm-register", "routes/ConfirmRegister.tsx"),
    route("new-game", "routes/NewGame.tsx"),
    route("game/:gameId", "routes/Game.tsx"),
] satisfies RouteConfig;