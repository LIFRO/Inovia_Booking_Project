import { createContext, useContext, useState, type ReactNode } from "react";
import { jwtDecode, type JwtPayload } from "jwt-decode";

export type UserRole = "Admin" | "User" | null;

type AuthUser = {
    userRole: Exclude<UserRole, null>;
    userName: string;
    userId: string;
};

interface AuthContextType {
    userRole: UserRole;
    userName: string;
    userId: string;
    signIn: (token: string) => void;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

function userFromToken(token: string): AuthUser | null {
    try {
        const claims = jwtDecode<JwtPayload & Record<string, unknown>>(token);
        const role = claims[ROLE_CLAIM];
        const name = claims.unique_name;

        if (
            typeof claims.exp !== "number" || claims.exp * 1000 <= Date.now() ||
            (role !== "Admin" && role !== "User") ||
            typeof name !== "string" || !name ||
            typeof claims.sub !== "string" || !claims.sub
        ) {
            return null;
        }

        return { userRole: role, userName: name, userId: claims.sub };
    } catch {
        return null;
    }
}

function readStoredUser(): AuthUser | null {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const user = userFromToken(token);
    if (!user) localStorage.removeItem("token");
    return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(readStoredUser);

    function signIn(token: string) {
        const nextUser = userFromToken(token);
        if (!nextUser) throw new Error("Invalid or expired login token");

        localStorage.setItem("token", token);
        setUser(nextUser);
    }

    function signOut() {
        localStorage.removeItem("token");
        setUser(null);
    }

    return (
        <AuthContext value={{
            userRole: user?.userRole ?? null,
            userName: user?.userName ?? "",
            userId: user?.userId ?? "",
            signIn,
            signOut,
        }}>
            {children}
        </AuthContext>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("no AuthContext");
    return context;
}
