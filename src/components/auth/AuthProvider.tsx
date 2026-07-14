"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabaseClient";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  fullName: string;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export default function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const user = session?.user ?? null;

  useEffect(() => {
    let isMounted = true;

    function updateSession(nextSession: Session | null) {
      if (!isMounted) return;

      setSession(nextSession);
      setIsLoading(false);
    }

    // Membaca session ketika aplikasi pertama kali dimuat.
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;

      if (error) {
        console.error("Gagal membaca session:", error);
      }

      updateSession(data.session);
    });

    // Menjaga navbar dan seluruh aplikasi tetap sinkron
    // saat login, logout, atau token diperbarui.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      updateSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadProfile() {
      if (!user) {
        setFullName("");
        return;
      }

      const metadataName =
        typeof user.user_metadata?.name === "string"
          ? user.user_metadata.name
          : typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : "";

      setFullName(metadataName);

      const { data, error } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (isCancelled) return;

      if (error) {
        console.error("Gagal mengambil profil pengguna:", error);
        return;
      }

      if (data?.full_name) {
        setFullName(data.full_name);
      }
    }

    void loadProfile();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      fullName,
      isLoading,
      signOut,
    }),
    [session, user, fullName, isLoading],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider.");
  }

  return context;
}