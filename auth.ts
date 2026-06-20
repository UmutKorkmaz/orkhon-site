// NextAuth v5 (Auth.js) config — the canonical auth entry.
// middleware.ts and app/api/auth/[...nextauth]/route.ts both re-export from here.
// `lib/auth.ts -> getSessionUser()` is the tiny server-side seam the chat backend
// reads (it calls auth() below).
//
// Provider: Google. Reads GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / AUTH_SECRET
// from env. Until those are set, the site loads fine and visitors stay anonymous
// (signIn("google") will error at runtime — see SETUP). No DB adapter: JWT sessions.

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      tier?: "user";
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  pages: {
    error: "/auth/error",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    // No route is blocked — middleware just enables session propagation.
    authorized: async () => true,
    async jwt({ token, profile }) {
      // First sign-in: profile is populated. Mark the tier once.
      if (profile) token.tier = "user" as const;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.tier) {
        session.user.tier = token.tier as "user";
      }
      return session;
    },
  },
});
