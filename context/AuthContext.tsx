import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import firebase from 'firebase/compat/app';
import { auth } from '../firebaseConfig';

// FIX: Replaced `User` from 'firebase/auth' with `firebase.User`.
// The project uses the Firebase compat library where the User type is namespaced.
interface AuthContextType {
    user: firebase.User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<firebase.User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        const setupAuthListener = async () => {
            try {
                // Set persistence to 'none' for environments that don't support web storage (like some sandboxed iframes).
                // This uses in-memory storage, so the user will be logged out on page refresh, but allows auth to function.
                await auth.setPersistence(firebase.auth.Auth.Persistence.NONE);
            } catch (error) {
                console.error("Firebase: Could not set auth persistence.", error);
            } finally {
                unsubscribe = auth.onAuthStateChanged((user) => {
                    setUser(user);
                    setLoading(false);
                });
            }
        };

        setupAuthListener();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    const value = { user, loading };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
