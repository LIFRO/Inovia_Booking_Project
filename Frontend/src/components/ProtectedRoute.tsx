import { useAuth } from "../ts/types/AuthContext";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import type { UserRole } from "../ts/types/AuthContext"; 




interface ProtectedRouteProps {
    children: ReactNode,
    requiredRole?: UserRole
}
export default function ProtectedRoute({children, requiredRole}: ProtectedRouteProps) {
    const {userRole} = useAuth();
    if(userRole === null) return <Navigate to="/login" />;
    if(requiredRole && userRole !== requiredRole) return <Navigate to="/" />
    return children;
}
