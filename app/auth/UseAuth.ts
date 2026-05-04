import { useContext } from 'react';
import { AuthContext } from '@auth/AuthContext';

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error(
            'useAuth has to be used within an AuthProvider. Please wrap your component tree with <AuthProvider>.',
        )
    return context;
}