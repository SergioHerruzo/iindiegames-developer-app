import { ProtectedRoute } from "@components/ProtectedRoute";
export default function GuestGuard() {
    return <ProtectedRoute requireAuth={false} />;
}