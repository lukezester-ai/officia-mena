import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

export const authConfig = {
  providers: [
    Google,
    // Note: The Credentials provider authorize function needs DB access,
    // but we can't put DB logic in the config if it runs in edge middleware.
    // However, in NextAuth v5, the authorize function is NOT executed in the middleware,
    // it's executed in the Node API route. But just importing the DB in the config
    // file would break middleware. So we'll define the credentials provider in auth.ts instead,
    // OR we can just bypass edge middleware for NextAuth by returning a normal middleware.
  ],
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
