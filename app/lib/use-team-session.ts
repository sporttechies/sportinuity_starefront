"use client";

import { useEffect, useState } from "react";
import { AUTH_EVENT, getTeamToken, getTeamUser, type TeamUser } from "./api";

/**
 * The signed-in team admin (or null). `ready` is false until the browser has
 * been checked, so pages can avoid flashing a "please sign in" message.
 */
export function useTeamSession() {
  const [state, setState] = useState<{ ready: boolean; user: TeamUser | null }>(
    { ready: false, user: null },
  );
  useEffect(() => {
    const sync = () =>
      setState({ ready: true, user: getTeamToken() ? getTeamUser() : null });
    sync();
    window.addEventListener(AUTH_EVENT, sync);
    return () => window.removeEventListener(AUTH_EVENT, sync);
  }, []);
  return state;
}
