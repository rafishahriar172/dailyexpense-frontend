/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

// Extend NextAuth types to include custom fields
declare module "next-auth" {
  interface User {
    accessToken?: string;
    refreshToken?: string;
    id?: string;
    email?: string;
    name?: string;
    image?: string;
  }
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      id?: string;
      email?: string;
      name?: string;
      image?: string;
    };
  }
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    user?: {
      id?: string;
      email?: string;
      name?: string;
      image?: string;
    };
  }
}

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              email: credentials?.email,
              password: credentials?.password,
            }
          );
          
          if (res.data?.accessToken) {
            return {
              id: res.data.user.id,
              email: res.data.user.email,
              name: res.data.user.name,
              image: res.data.user.image,
              accessToken: res.data.accessToken,
              refreshToken: res.data.refreshToken,
            };
          }
          return null;
        } catch (err) {
          console.error("Login error", err);
          return null;
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          if (!profile) {
            return false;
          }
          const googleProfile = profile as {
            email?: string;
            given_name?: string;
            family_name?: string;
            picture?: string;
            sub?: string;
          };

          const googleAuthDto = {
            googleId: googleProfile.sub,
            email: googleProfile.email,
            firstName: googleProfile.given_name,
            lastName: googleProfile.family_name,
            profileImage: googleProfile.picture,
          };

          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
            googleAuthDto,
            {
              headers: {
                Authorization: `Bearer ${account.id_token}`,
              },
            }
          );

          if (response.data?.accessToken) {
            // Update user object with backend response
            user.accessToken = response.data.accessToken;
            user.refreshToken = response.data.refreshToken;
            user.id = response.data.user.id;
            user.email = response.data.user.email;
            user.name = response.data.user.name;
            user.image = response.data.user.image || googleProfile.picture;
            return true;
          }
          return false;
        } catch (error) {
          console.error("Google auth error:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account, trigger }) {
      // Handle sign in
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }

      // Handle session update
      if (trigger === "update") {
        // You can update token here if needed
      }

      return token;
    },

    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        session.accessToken = token.accessToken as string | undefined;
        session.refreshToken = token.refreshToken as string | undefined;
        session.user = {
          ...session.user,
          id: token.user?.id,
          email: token.user?.email,
          name: token.user?.name,
          image: token.user?.image,
        };
      }
      return session;
    },
  },

  events: {
    async signOut({ token }) {
      // Clear any server-side session data if needed
      console.log("User signed out:", token?.user?.email);
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
});