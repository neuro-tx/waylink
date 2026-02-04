"use client";

import { createContext, useContext, useState, useEffect } from "react";
import AuthModal from "../AuthModel";

interface AuthContextType {
  isAuthenticated: boolean;
  openModal: () => void;
  closeModal: () => void;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const login = () => {
    setIsAuthenticated(true);
    setIsModalOpen(false);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        openModal,
        closeModal,
        login,
        logout,
      }}
    >
      {children}
      <AuthModal isOpen={isModalOpen} onClose={closeModal} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
