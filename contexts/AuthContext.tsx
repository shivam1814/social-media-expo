// import { User } from "@supabase/supabase-js";
import React, { createContext, useState, ReactNode, useContext } from "react";
import { Pressable } from "react-native";

// export interface authUserData {
//   id: string;
//   created_at: string;
//   name: string;
//   image: string;
//   bio: string;
//   email: string;
//   address: string;
//   phoneNumber: string;
// }

// export type UserType = authUserData & User;

// Define the shape of the context value
// interface AuthContextType {
//   user: (authUserData & User) | null;
//   setAuth: (authUser: (authUserData & User) | null) => void;
//   setUserData: (userData: UserType) => void;
// }

interface AuthContextType {
  user: any | null;
  setAuth: (authUser: any | null) => void;
  setUserData: (userData: any ) => void;
}

// Initialize the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);

  const setAuth = (authUser: any | null) => {
    setUser(authUser);
  };

  const setUserData = (userData: any ) => {
    setUser({ ...userData });
  };

  return (
    <AuthContext.Provider value={{ user, setAuth, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
