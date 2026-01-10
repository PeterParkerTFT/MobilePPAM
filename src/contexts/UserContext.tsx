
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/models';
import { UserService, MockUserRepository } from '../services/userService';
import { SupabaseUserRepository } from '../services/SupabaseUserRepository';
import { supabase } from '../lib/supabase';

// Define the context shape
interface UserContextType {
    currentUser: User | null;
    isLoading: boolean;
    isPasswordRecovery?: boolean;
    login: (user: User) => void;
    logout: () => void;
    userService: UserService;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Instantiate service once (Singleton pattern for this session)
// If supabase client exists (keys are present), use Supabase repository
const userRepository = supabase ? new SupabaseUserRepository() : new MockUserRepository();
const userServiceInstance = new UserService(userRepository);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(false);

    // Load user from storage and listen to Supabase auth state
    useEffect(() => {
        // 1. Check local storage first (Legacy/Fast load)
        const loadSession = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setCurrentUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error('Error parsing stored user', e);
                    localStorage.removeItem('user');
                }
            }
            setIsLoading(false);
        };
        loadSession();

        // 2. Listen to Supabase Auth Events (Critical for Password Reset)
        if (supabase) {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'PASSWORD_RECOVERY') {
                    setIsPasswordRecovery(true);
                } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    // Update user if needed, or just let the login flow handle it
                    // For now, we rely on manual login calls updates, but we could sync here.
                } else if (event === 'SIGNED_OUT') {
                    setIsPasswordRecovery(false);
                }
            });

            return () => {
                subscription.unsubscribe();
            };
        }
    }, []);

    const login = (user: User) => {
        setCurrentUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        setIsPasswordRecovery(false); // Clear recovery flag on login
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('user');
        if (supabase) supabase.auth.signOut();
        window.location.reload(); // Force reload to clear any other state
    };

    const value = {
        currentUser,
        isLoading,
        isPasswordRecovery, // Expose this
        login,
        logout,
        userService: userServiceInstance,
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

// Custom hook for easier usage
export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
