export type LoginData = {
  email: string;
  password: string;
};

export type RegisterData = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

// For login, use NextAuth directly
export const loginUser = async (data: LoginData) => {
  // This should use NextAuth's signIn function instead
  // import { signIn } from "next-auth/react";
  // return signIn("credentials", { ...data, redirect: false });
  
  // If you still want to use your API directly:
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    throw new Error(`Login failed: ${res.statusText}`);
  }
  
  return res.json();
};

// For registration, use your custom API route
export const registerUser = async (data: RegisterData) => {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || `Registration failed: ${res.statusText}`);
  }
  
  return res.json();
};