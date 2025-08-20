import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL, // http://localhost:5000/api/v1
      withCredentials: true,
    });
    api
      .get("/transactions/statistics", {
        headers: {
          Authorization: req.headers.authorization, // ✅ forward token
        },
      })
      .then((response) => {
        res.status(200).json({ success: true, data: response.data });
      })
      .catch((error) => {
        console.error("Error fetching transaction statistics:", error);
        res.status(error.response?.status || 500).json({
          success: false,
          message:
            error.response?.data?.message ||
            "An error occurred while fetching transaction statistics.",
        });
      });
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
