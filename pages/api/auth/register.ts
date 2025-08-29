import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST method
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/register`;
    
    console.log("Registering user with backend:", backendUrl);
    console.log("Request body:", req.body);

    const response = await axios.post(backendUrl, req.body, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Forward the response from your backend
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Registration error:", error);
    
    if (axios.isAxiosError(error)) {
      // If the error is from axios (backend API error)
      return res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || "Registration failed",
      });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
}