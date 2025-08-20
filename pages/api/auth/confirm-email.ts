// pages/api/auth/confirm-email.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }
    // Call your backend API to confirm the email
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/confirm-email?token=${token}`;

    const response = await axios.post(
      backendUrl,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Forward the response from your backend
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Email confirmation error:", error);

    if (axios.isAxiosError(error)) {
      // If the error is from axios (backend API error)
      return res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || "Email confirmation failed",
      });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
}
