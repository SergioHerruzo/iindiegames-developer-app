import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/index.tsx"),
	route("landing", "routes/Landing.tsx"),
	route("dashboard", "routes/dashboard.tsx"),
	route("auth/refresh", "routes/auth.refresh.tsx"),
	route("login", "routes/login.tsx"),
	route("register", "routes/register.tsx"),
	route("developer-agreement", "routes/DeveloperAgreement.tsx"),
	route("create-game", "routes/create-game.tsx"),
	route("game-details/:id", "routes/GameDetails.tsx"),
] satisfies RouteConfig;