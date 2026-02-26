import NextAuth from "next-auth";

// Edge-compatible auth config for middleware (no Prisma, no bcrypt)
export const { auth } = NextAuth({
  providers: [],
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    jwt({ token }) {
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
