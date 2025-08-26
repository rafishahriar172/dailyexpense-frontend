/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth"

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
}

declare module "next-auth/jwt" {
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