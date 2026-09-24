import { createContext, useContext, useState, type ReactNode } from "react"



export type UserRole = "Admin" | "User" | null;

interface AuthContextType {
    userRole: UserRole,
    setUserRole:(role: UserRole) => void
    userName: string,
    setUserName: (userName: string) => void,
    userId: string,
    setUserId:(userId:string) => void
}

interface AuthProviderProps{
    children: ReactNode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)



export function AuthProvider({children}: AuthProviderProps) {
    const [userName, setUserName] = useState<string>("");
    const [userId, setUserId] = useState<string>("")
    const [userRole, setUserRole] = useState<UserRole>(null)

    return(
        <AuthContext value={{userRole, setUserRole, userName, setUserName, userId, setUserId}} >{children}
        </AuthContext>
    )
}


export function useAuth(){
    const context = useContext(AuthContext);
    if(!context){
        throw new Error("no AuthContext")
    }
    return context;
}
