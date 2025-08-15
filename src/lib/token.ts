import Cookies from "js-cookie";
import { getSession } from "next-auth/react";

/**
 * Gets the access token from either cookies (manual login) or NextAuth session (Google login).
 */
export async function getAccessToken() {
  let token = Cookies.get("access_token");
  if (!token) {
    const session = await getSession();
    token = session?.backendAccessToken || "";
  }
  return token;
}
