"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabaseClient";
import {
  resolveAccountProfile,
  type AccountProfile,
  type AccountType,
} from "@/services/auth/accountProfileService";

type AuthContextValue = {
  session: Session | null;
  user: User | null;

  accountProfile: AccountProfile | null;
  accountType: AccountType | null;

  fullName: string;
  dashboardHref: string | null;

  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export default function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);

  const [accountProfile, setAccountProfile] = useState<AccountProfile | null>(
    null,
  );

  const [resolvedProfileUserId, setResolvedProfileUserId] = useState<
    string | null
  >(null);

  const [isSessionLoading, setIsSessionLoading] = useState(true);

  const currentUserIdRef = useRef<string | null>(null);

  const user = session?.user ?? null;

  /*
   * Membaca dan menjaga session Supabase tetap sinkron.
   */
  useEffect(() => {
    let isMounted = true;

    function applySession(nextSession: Session | null) {
      if (!isMounted) {
        return;
      }

      const nextUserId = nextSession?.user.id ?? null;

      /*
       * Bersihkan profil lama apabila user berubah
       * atau melakukan logout.
       */
      if (currentUserIdRef.current !== nextUserId) {
        setAccountProfile(null);
        setResolvedProfileUserId(null);
      }

      currentUserIdRef.current = nextUserId;

      setSession(nextSession);
      setIsSessionLoading(false);
    }

    async function initializeSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error("Gagal membaca session:", error);
      }

      applySession(data.session);
    }

    void initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /*
   * Menentukan jenis akun berdasarkan tabel profil:
   *
   * users           -> customer
   * brands          -> brand
   * waste_providers -> waste_provider
   */
  useEffect(() => {
    let isCancelled = false;

    async function loadAccountProfile() {
      if (!user) {
        setAccountProfile(null);
        setResolvedProfileUserId(null);
        return;
      }

      const currentUserId = user.id;

      try {
        const profile = await resolveAccountProfile(currentUserId);

        if (isCancelled) {
          return;
        }

        if (!profile) {
          console.error(
            "User memiliki session Auth, tetapi tidak ditemukan pada tabel users, brands, maupun waste_providers.",
          );

          setAccountProfile(null);
          return;
        }

        setAccountProfile(profile);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error("Gagal menentukan jenis akun:", error);

        setAccountProfile(null);
      } finally {
        if (!isCancelled) {
          /*
           * Tetap tandai proses sebagai selesai,
           * termasuk ketika profil tidak ditemukan.
           */
          setResolvedProfileUserId(currentUserId);
        }
      }
    }

    void loadAccountProfile();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  const metadataName = useMemo(() => {
    if (!user) {
      return "";
    }

    if (typeof user.user_metadata?.name === "string") {
      return user.user_metadata.name;
    }

    if (typeof user.user_metadata?.full_name === "string") {
      return user.user_metadata.full_name;
    }

    return "";
  }, [user]);

  const fullName = accountProfile?.name || metadataName || user?.email || "";

  const accountType = accountProfile?.type ?? null;

  const dashboardHref = accountProfile?.dashboardHref ?? null;

  /*
   * Loading baru selesai apabila:
   *
   * 1. Session selesai dibaca.
   * 2. Profil user aktif selesai diperiksa.
   */
  const isLoading =
    isSessionLoading || Boolean(user && resolvedProfileUserId !== user.id);

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setSession(null);
    setAccountProfile(null);
    setResolvedProfileUserId(null);

    currentUserIdRef.current = null;
  }

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      session,
      user,

      accountProfile,
      accountType,

      fullName,
      dashboardHref,

      isLoading,
      signOut,
    }),
    [
      session,
      user,
      accountProfile,
      accountType,
      fullName,
      dashboardHref,
      isLoading,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider.");
  }

  return context;
}
