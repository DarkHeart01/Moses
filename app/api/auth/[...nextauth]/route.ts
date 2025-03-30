// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.id = profile?.sub;
      }
      return token;
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider
      if (session.user) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
    async signIn({ account, profile }) {
      if (!profile?.email) {
        return false;
      }

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email: profile.email }
      });

      // If user doesn't exist, create one with default 5 credits
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: profile.email,
            name: profile.name || "User",
            emailVerified: true, // Google already verified the email
            credits: 5, // Default credits for new users
          }
        });
      }

      return true;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt"
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
