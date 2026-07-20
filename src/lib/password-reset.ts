/** Requests a reset link through the server so email URLs always use Nexora's production host. */
export async function requestPasswordReset(email: string) {
  const response = await fetch("/api/public/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const result = (await response.json().catch(() => null)) as {
    ok?: boolean;
    message?: string;
  } | null;

  if (!response.ok || result?.ok === false) {
    throw new Error(result?.message || "Password reset email is temporarily unavailable.");
  }
}
