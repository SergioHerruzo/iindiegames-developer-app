import {
    createContext, useEffect,
    useState, useCallback
} from 'react';
import {
    getCurrentUser,
    signOut
} from 'aws-amplify/auth';
import type { AuthUser } from 'aws-amplify/auth';

interface AuthState {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
    refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadUser = useCallback(async () => {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadUser(); }, [loadUser]);

    const logout = useCallback(async () => {
        await signOut();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{
            user, isLoading, logout,
            isAuthenticated: user !== null,
            refreshSession: loadUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export { AuthContext };