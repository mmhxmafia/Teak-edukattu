import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { clearCacheAfterAuth } from '@/lib/cacheManager';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// GraphQL Mutations
const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      authToken
      user {
        id
        email
        firstName
        lastName
        username
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation RegisterUser($email: String!, $password: String!, $firstName: String!, $lastName: String!) {
    registerUser(
      input: {
        username: $email
        email: $email
        password: $password
        firstName: $firstName
        lastName: $lastName
      }
    ) {
      user {
        id
        email
        firstName
        lastName
        username
      }
    }
  }
`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: { username: email, password },
      });

      if (data?.login) {
        const { authToken, user: userData } = data.login;
        
        setToken(authToken);
        setUser(userData);
        
        // Save to localStorage
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Extract meaningful error message from GraphQL error
      let errorMessage = "Login failed. Please try again.";
      
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const graphQLError = error.graphQLErrors[0];
        const rawMessage = graphQLError.message || "";
        
        // Handle specific error cases
        if (rawMessage.includes("Unknown email") || 
            rawMessage.includes("unknown email") ||
            rawMessage.includes("not found")) {
          errorMessage = "Email address not found. Please check your email or register for an account.";
        } else if (rawMessage.includes("password") || 
                   rawMessage.includes("credentials")) {
          errorMessage = "Incorrect password. Please try again.";
        } else if (rawMessage.includes("Error") && rawMessage.includes("email")) {
          errorMessage = "Unknown email address. Please check your email or register for an account.";
        } else {
          // Use a generic message instead of trying to clean up the error
          errorMessage = "Authentication failed. Please verify your credentials and try again.";
        }
      } else if (error.networkError) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      }
      
      // Create a new error with the cleaned message
      const cleanError = new Error(errorMessage);
      throw cleanError;
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { data } = await registerMutation({
        variables: { email, password, firstName, lastName },
      });

      if (data?.registerUser?.user) {
        // After registration, automatically log in
        await login(email, password);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Extract meaningful error message from GraphQL error
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const graphQLError = error.graphQLErrors[0];
        
        // Handle specific error cases
        if (graphQLError.message.includes("email") && graphQLError.message.includes("exists")) {
          errorMessage = "This email address is already registered. Please log in instead.";
        } else if (graphQLError.message.includes("password") && 
                  (graphQLError.message.includes("weak") || graphQLError.message.includes("short"))) {
          errorMessage = "Please use a stronger password with at least 8 characters.";
        } else {
          // Clean up any HTML or special characters in the error message
          errorMessage = graphQLError.message
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&lt;/g, '<').replace(/&gt;/g, '>') // Replace HTML entities
            .replace(/\[.*?\]/g, '') // Remove square brackets and content
            .trim();
        }
      } else if (error.networkError) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      }
      
      // Create a new error with the cleaned message
      const cleanError = new Error(errorMessage);
      throw cleanError;
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Clear Apollo cache after logout
    await clearCacheAfterAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
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
