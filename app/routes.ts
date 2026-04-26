import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/index.tsx"),
	route("landing", "routes/Landing.tsx"),
	route("dashboard", "routes/dashboard.tsx"),
	route("login", "routes/login.tsx"),
	route("register", "routes/register.tsx"),
] satisfies RouteConfig;