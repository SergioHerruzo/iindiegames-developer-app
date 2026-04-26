import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { bootstrapAuth, isAuthenticated } from "../utils/auth";
import { isTauri } from "@tauri-apps/api/core";

export default function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bootstrapAuth().then(() => {
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  if (isTauri()) {
    return isAuthenticated()
      ? <Navigate to="/dashboard" replace />
      : <Navigate to="/login" replace />;
  }

  return <Navigate to="/landing" replace />;
}