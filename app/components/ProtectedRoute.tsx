import { Navigate, Outlet, useNavigate } from "react-router";
import { useAuth } from "@auth/UseAuth";
import { useEffect } from "react";

interface Props {
    requireAuth?: boolean;
    redirectTo?: string;
    allowedRoles?: string[];
}

export function ProtectedRoute({
    requireAuth = true,
    redirectTo,
    allowedRoles,
}: Props) {
    const { isAuthenticated, isLoading, profile } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate(redirectTo ?? "/login", { replace: true });
        }
    }, [isLoading, isAuthenticated]);

    if (isLoading) return null;

    if (!requireAuth) {
        return isAuthenticated
            ? <Navigate to={redirectTo ?? "/panel"} replace />
            : <Outlet />;
    }

    if (!isAuthenticated) return null;

    if (allowedRoles && !allowedRoles.includes(profile?.role ?? "")) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}