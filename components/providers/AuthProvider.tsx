"use client";

import { createContext, useContext, useState, useEffect } from "react";
import AuthModal from "../AuthModel";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  openModal: () => void;
  closeModal: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data?.user) {
          setUser(session.data.user);
          setIsModalOpen(false);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      setIsModalOpen(true);
      toast.success("Signed out successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to log out");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        openModal,
        closeModal,
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
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
