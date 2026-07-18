/** Requests a reset link from the server-side transactional email flow. */
export async function requestPasswordReset(email: string) {
  const response = await fetch("/api/public/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) throw new Error("Password reset email could not be sent.");
}
