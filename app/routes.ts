import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/Landing.tsx"),
	route("login", "routes/Login.tsx"),
	route("register", "routes/Register.tsx"),
	route("dashboard", "routes/Dashboard.tsx"),
] satisfies RouteConfig;
