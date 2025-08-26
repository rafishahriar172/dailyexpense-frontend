import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // console.log("Creating account with data:", req.body);
    const api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL, // http://localhost:5000/api/v1
      withCredentials: true,
    });
    api
      .post("/accounts", req.body, {
        headers: {
          Authorization: req.headers.authorization, // ✅ forward token
        },
      })
      .then((response) => {
        res.status(201).json({ success: true, data: response.data });
      })
      .catch((error) => {
        // console.error("Error creating account:", error.response);
        res.status(error.response?.status || 500).json({
          success: false,
          message:
            error.response?.data?.message ||
            "An error occurred while creating the account.",
        });
      });
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}