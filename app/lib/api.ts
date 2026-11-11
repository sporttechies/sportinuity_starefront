const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type TeamUser = {
  id: string;
  email: string;
  name: string;
  teamName: string;
  teamProfileId?: string;
  logoPath?: string | null;
  role: string;
};

export type RequestStatus =
  | "new"
  | "in_review"
  | "quoted"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "rejected";

export type TravellerInput = {
  firstName: string;
  lastName: string;
  type: string;
  documentNumber: string;
  dietary: string;
  category: "adult" | "child" | "infant";
};

export type TravellerRecord = {
  id: string;
  index: number;
  category: "adult" | "child" | "infant";
  firstName: string;
  lastName: string;
  type: string;
  documentNumber: string | null;
  dietary: string | null;
};

export type RequestEvent = {
  id: string;
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  note: string | null;
  actorRole: string | null;
  actorName: string | null;
  createdAt: string;
};

export type TeamRequest = {
  id: string;
  reference: string;
  team: string;
  event: string;
  from: string | null;
  location: string;
  departure: string | null;
  returnDate: string | null;
  people: number;
  status: RequestStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  contact: { name: string | null; email: string | null; phone: string | null };
  travellers?: TravellerRecord[];
  events?: RequestEvent[];
};

export type TeamProfile = {
  id: string;
  name: string;
  sport: string;
  country: string;
  city: string | null;
  logoPath: string | null;
  createdAt: string;
  admin: { name: string; email: string };
  requestCounts: Record<string, number>;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Turns an API-relative path (like a logo path) into a full URL. */
export function apiUrl(path?: string | null): string | null {
  if (!path) return null;
  return path.startsWith("http") ? path : `${API_URL}${path}`;
}

// ---- session -------------------------------------------------------------
const TOKEN_KEY = "sportinuity_team_token";
const USER_KEY = "sportinuity_team_user";
export const AUTH_EVENT = "sportinuity:auth";

function announce() {
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event(AUTH_EVENT));
}

export function getTeamToken() {
  return typeof window === "undefined" ? null : sessionStorage.getItem(TOKEN_KEY);
}
export function getTeamUser(): TeamUser | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(sessionStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}
export function saveTeamSession(token: string, user: TeamUser) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  announce();
}
export function updateStoredUser(patch: Partial<TeamUser>) {
  const current = getTeamUser();
  if (!current) return;
  sessionStorage.setItem(USER_KEY, JSON.stringify({ ...current, ...patch }));
  announce();
}
export function clearTeamSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  announce();
}

// ---- http ----------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function request<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getTeamToken();
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(
      "We couldn't reach the server. Check your connection and try again.",
      0,
    );
  }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    // An expired or revoked session: forget it so the UI asks to sign in again.
    if (response.status === 401 && token && !path.includes("/login"))
      clearTeamSession();
    throw new ApiError(data.message || "Request failed", response.status);
  }
  return data as T;
}

// ---- account -------------------------------------------------------------
export async function registerTeam(body: {
  teamName: string;
  name: string;
  email: string;
  password: string;
  sport: string;
  country: string;
  city?: string;
}) {
  return request<{ token: string; user: TeamUser }>("/api/auth/team/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
export async function loginTeam(body: { email: string; password: string }) {
  return request<{ token: string; user: TeamUser }>("/api/auth/team/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
export async function getTeamSession() {
  const result = await request<{ user: TeamUser }>("/api/auth/team/me");
  updateStoredUser(result.user);
  return result;
}

// ---- team profile --------------------------------------------------------
export async function getTeamProfile() {
  return (await request<{ data: TeamProfile }>("/api/team/profile")).data;
}
export async function updateTeamProfile(patch: {
  name?: string;
  sport?: string;
  country?: string;
  city?: string | null;
  adminName?: string;
  /** data URL to set a new logo, null to remove it, omit to keep it */
  logo?: string | null;
}) {
  const result = await request<{ data: TeamProfile }>("/api/team/profile", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  updateStoredUser({
    teamName: result.data.name,
    name: result.data.admin.name,
    logoPath: result.data.logoPath,
  });
  return result.data;
}

// ---- requests ------------------------------------------------------------
export async function listTeamRequests(
  params: { status?: string; q?: string; limit?: number; offset?: number } = {},
) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  return request<{
    data: TeamRequest[];
    total: number;
    counts: Record<string, number>;
  }>(`/api/team/requests?${search}`);
}
export async function getTeamRequest(reference: string) {
  return (
    await request<{ data: TeamRequest }>(
      `/api/team/requests/${encodeURIComponent(reference)}`,
    )
  ).data;
}
export async function cancelTeamRequest(reference: string, reason?: string) {
  return (
    await request<{ data: TeamRequest }>(
      `/api/team/requests/${encodeURIComponent(reference)}/cancel`,
      { method: "POST", body: JSON.stringify({ reason }) },
    )
  ).data;
}
export async function createTeamRequest(body: {
  event: string;
  location: string;
  from?: string;
  departure?: string;
  returnDate?: string;
  contact: { name: string; email: string; phone: string };
  travellers: TravellerInput[];
}) {
  return (
    await request<{ data: TeamRequest }>("/api/team/requests", {
      method: "POST",
      body: JSON.stringify(body),
    })
  ).data;
}

// ---- saved draft (the "cart") --------------------------------------------
export async function getServerDraft() {
  return request<{ data: unknown | null; updatedAt: string | null }>(
    "/api/team/draft",
  );
}
export async function saveServerDraft(draft: unknown) {
  return request<{ updatedAt: string }>("/api/team/draft", {
    method: "PUT",
    body: JSON.stringify(draft),
  });
}
export async function deleteServerDraft() {
  return request<void>("/api/team/draft", { method: "DELETE" });
}
