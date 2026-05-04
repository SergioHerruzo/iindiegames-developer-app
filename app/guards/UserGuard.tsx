import { ProtectedRoute } from "@components/ProtectedRoute";
export default function UserGuard() {
    return <ProtectedRoute allowedRoles={["User"]} />;
}