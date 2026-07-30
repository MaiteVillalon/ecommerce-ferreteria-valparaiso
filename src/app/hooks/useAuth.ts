import { useEffect, useState, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { obtenerCliente, type Cliente } from "@/lib/clientes";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCliente = useCallback(async (userId: string) => {
    const perfil = await obtenerCliente(userId);
    setCliente(perfil);
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) refreshCliente(data.session.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!active) return;
      setSession(newSession);
      if (newSession) refreshCliente(newSession.user.id);
      else setCliente(null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [refreshCliente]);

  return {
    session,
    cliente,
    loading,
    refreshCliente: () => (session ? refreshCliente(session.user.id) : Promise.resolve()),
  };
}
