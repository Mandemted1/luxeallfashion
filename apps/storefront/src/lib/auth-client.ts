import { createAuthClient } from "better-auth/react";

// No baseURL needed — the client only ever talks to this same app's own
// /api/auth routes (same-origin), never the admin app's.
export const authClient = createAuthClient();

export const { signIn, signOut, useSession, requestPasswordReset, resetPassword } = authClient;
