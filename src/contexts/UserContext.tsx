
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/models';
import { UserService, MockUserRepository } from '../services/userService';

// Define the context shape
interface UserContextType {
    currentUser: User | null;
    isLoading: boolean;
    login: (user: User) => void;
    logout: () => void;
    userService: UserService;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Instantiate service once (Singleton pattern for this session)
// In a real app, this might come from a DI container or custom hook
const userRepository = new MockUserRepository();
const userServiceInstance = new UserService(userRepository);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Load user from storage on mount (simulated)
    useEffect(() => {
        const loadSession = async () => {
            // Here you would check localStorage or a session cookie
            // const storedUser = localStorage.getItem('user');
            // if (storedUser) setCurrentUser(JSON.parse(storedUser));
            setIsLoading(false);
        };
        loadSession();
    }, []);

    const login = (user: User) => {
        setCurrentUser(user);
        // localStorage.setItem('user', JSON.stringify(user));
    };

    const logout = () => {
        setCurrentUser(null);
        // localStorage.removeItem('user');
    };

    const value = {
        currentUser,
        isLoading,
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
