import {
    createContext, useEffect,
    useState, useCallback
} from 'react';
import {
    getCurrentUser,
    signOut
} from 'aws-amplify/auth';
import type { AuthUser } from 'aws-amplify/auth';
import type { UserProfile } from '@models/UserProfile';
import { apiClient } from '@services/ApiClient';


interface AppUser {
    cognitoUser: AuthUser,
    profile: UserProfile
}

interface AuthState {
    user: AuthUser | null;
    profile: UserProfile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
    refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadUser = useCallback(async () => {
        try {
            const cognitoUser = await getCurrentUser();
            const response = await apiClient.get('/users/me');
            if (!response.ok)
                throw new Error('Failed to fetch user profile');

            const profile: UserProfile = await response.json();
            setUser({ cognitoUser, profile });
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
            user: user?.cognitoUser || null,
            profile: user?.profile || null,
            isLoading,
            logout,
            isAuthenticated: user !== null,
            refreshSession: loadUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export { AuthContext };