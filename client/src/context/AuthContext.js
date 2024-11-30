import React, { createContext, useState, useContext } from 'react';

// Create the AuthContext
export const AuthContext = createContext();

// Provide the AuthContext
export function AuthProvider({ children }) {
    // Initialize from localStorage
    const [authState, setAuthState] = useState({ userId: localStorage.getItem('userId') || null });

    return (
        <AuthContext.Provider value={{ authState, setAuthState }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook to use the AuthContext
export function useAuth() {
    return useContext(AuthContext);
}
