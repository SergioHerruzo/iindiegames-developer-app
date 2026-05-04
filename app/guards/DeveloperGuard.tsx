import { ProtectedRoute } from "@components/ProtectedRoute";
export default function DeveloperGuard() {
    return <ProtectedRoute allowedRoles={["Developer"]} />;
}