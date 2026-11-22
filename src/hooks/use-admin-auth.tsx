import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import type { Enums } from "@/integrations/supabase/types";

type AppRole = Enums<"app_role">;

interface AdminAuthState {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  isAdmin: boolean;
  isEditor: boolean;
  isStaff: boolean;
  isLoading: boolean;
}

interface UseAdminAuthReturn extends AdminAuthState {
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

async function fetchUserRole(userId: string): Promise<AppRole | null> {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[AdminAuth] Failed to fetch role:", error);
      return null;
    }

    return data?.role ?? null;
  } catch (err) {
    console.error("[AdminAuth] Unexpected error fetching role:", err);
    return null;
  }
}

export function useAdminAuth(): UseAdminAuthReturn {
  const [state, setState] = useState<AdminAuthState>({
    session: null,
    user: null,
    role: null,
    isAdmin: false,
    isEditor: false,
    isStaff: false,
    isLoading: true,
  });

  // User whose role is already loaded. Token refreshes (about hourly) and tab-focus
  // events re-send the same session; for those we must NOT show the loading screen,
  // because that unmounts the admin panel and throws away unsaved form input.
  const resolvedUserId = useRef<string | null>(null);

  const updateStateFromSession = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      resolvedUserId.current = null;
      setState({
        session: null,
        user: null,
        role: null,
        isAdmin: false,
        isEditor: false,
        isStaff: false,
        isLoading: false,
      });
      return;
    }

    if (resolvedUserId.current === session.user.id) {
      // Same user: keep role and UI as they are, just store the fresh session.
      setState((prev) => ({ ...prev, session, user: session.user }));
      return;
    }

    setState((prev) => ({ ...prev, session, user: session.user, isLoading: true }));

    const role = await fetchUserRole(session.user.id);
    resolvedUserId.current = session.user.id;

    setState({
      session,
      user: session.user,
      role,
      isAdmin: role === "admin",
      isEditor: role === "editor",
      isStaff: role === "admin" || role === "editor",
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    // onAuthStateChange also fires INITIAL_SESSION on subscribe, so no separate
    // getSession() call is needed. Supabase warns against awaiting other Supabase
    // calls inside this callback (it can deadlock the client), so the role lookup
    // is deferred to the next tick.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setTimeout(() => {
        if (mounted) void updateStateFromSession(session);
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [updateStateFromSession]);

  const signOut = useCallback(async () => {
    resolvedUserId.current = null;
    await supabase.auth.signOut();
    setState({
      session: null,
      user: null,
      role: null,
      isAdmin: false,
      isEditor: false,
      isStaff: false,
      isLoading: false,
    });
  }, []);

  const refreshRole = useCallback(async () => {
    if (!state.user) return;
    const role = await fetchUserRole(state.user.id);
    setState((prev) => ({
      ...prev,
      role,
      isAdmin: role === "admin",
      isEditor: role === "editor",
      isStaff: role === "admin" || role === "editor",
    }));
  }, [state.user]);

  return { ...state, signOut, refreshRole };
}
