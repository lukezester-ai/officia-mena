import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { withUserLookupDb } from "@/lib/db/db";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isDemo: { label: "Demo", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const emailStr = credentials.email as string;
        
        // Find user by email
        const userRecords = await withUserLookupDb(emailStr, (authDb) => authDb
          .select()
          .from(users)
          .where(eq(users.email, emailStr.trim().toLowerCase()))
          .limit(1));

        const user = userRecords[0];
        
        if (!user) return null;

        // If it's the demo login, we bypass password check (only for demo user)
        if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEMO_LOGIN === "true" && credentials.isDemo === "true" && emailStr === "demo@officia.mena") {
          return { id: user.id, email: user.email, name: `${user.firstName || ''} ${user.lastName || ''}`.trim(), tenantId: user.tenantId };
        }

        // Verify password
        if (user.passwordHash && credentials.password) {
          const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);
          if (isValid) {
            return { id: user.id, email: user.email, name: `${user.firstName || ''} ${user.lastName || ''}`.trim(), tenantId: user.tenantId };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const normalizedEmail = user.email.trim().toLowerCase();
      const [appUser] = await withUserLookupDb(normalizedEmail, (authDb) => authDb
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1));

      // OAuth access is invite-only: the user must already exist in Officia.
      return Boolean(appUser);
    },
    async jwt({ token, user }) {
      const email = user?.email ?? token.email;
      if (email) {
        const normalizedEmail = email.trim().toLowerCase();
        const [appUser] = await withUserLookupDb(normalizedEmail, (authDb) => authDb
          .select({ id: users.id, tenantId: users.tenantId })
          .from(users)
          .where(eq(users.email, normalizedEmail))
          .limit(1));

        if (appUser) {
          token.id = appUser.id;
          token.tenantId = appUser.tenantId;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).tenantId = token.tenantId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
