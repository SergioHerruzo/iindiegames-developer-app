import { useEffect } from "react";
import { useLocation } from "react-router";

const routeTitles: Record<string, string> = {
  "/": "Inicio",
  "/panel": "Panel",
  "/login": "Login",
  "/register": "Registro",
  "/new-game": "Crear Juego",
  "/game-details/:gameId": "Detalles del Juego",
};

function matchRoute(pathname: string): string | undefined {
  for (const [pattern, title] of Object.entries(routeTitles)) {
    const regexStr = pattern.replace(/:([^/]+)/g, "[^/]+");
    const regex = new RegExp(`^${regexStr}$`);
    if (regex.test(pathname)) return title;
  }
}

export function TitleManager() {
  const location = useLocation();

  useEffect(() => {
    const title = matchRoute(location.pathname);
    document.title = title ?? "Indie Games Developer";
  }, [location.pathname]);

  return <></>;
}