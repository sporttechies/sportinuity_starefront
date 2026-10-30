const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
export type TeamUser = {
  id: string;
  email: string;
  name: string;
  teamName: string;
  role: string;
};
export function getTeamToken() {
  return typeof window === "undefined"
    ? null
    : sessionStorage.getItem("sportinuity_team_token");
}
export function saveTeamSession(token: string, user: TeamUser) {
  sessionStorage.setItem("sportinuity_team_token", token);
  sessionStorage.setItem("sportinuity_team_user", JSON.stringify(user));
}
export function clearTeamSession() {
  sessionStorage.removeItem("sportinuity_team_token");
  sessionStorage.removeItem("sportinuity_team_user");
}
export function getTeamUser(): TeamUser | null {
  try {
    return JSON.parse(
      sessionStorage.getItem("sportinuity_team_user") || "null",
    );
  } catch {
    return null;
  }
}
async function request(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(getTeamToken() ? { Authorization: `Bearer ${getTeamToken()}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}
export async function registerTeam(body: {
  teamName: string;
  name: string;
  email: string;
  password: string;
}) {
  return request("/api/auth/team/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
export async function loginTeam(body: { email: string; password: string }) {
  return request("/api/auth/team/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
export async function getTeamSession() {
  return request("/api/auth/team/me");
}
export async function createLogisticsRequest(body: Record<string, unknown>) {
  return request("/api/logistics/public-requests", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
export async function getPublicRequest(id: string) {
  return request(`/api/logistics/public-requests/${id}`);
}
export async function getManagedRequest(id: string) {
  return request(`/api/logistics/requests/${id}`);
}
