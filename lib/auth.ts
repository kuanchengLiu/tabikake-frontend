// Auth helpers for token management via Next.js API routes
// The JWT is stored as an httpOnly cookie, set server-side.
// Client code never reads the token directly.

export async function setAuthToken(token: string): Promise<void> {
  const res = await fetch("/api/auth/set-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    throw new Error("Failed to store auth token");
  }
}

export async function clearAuthToken(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}
