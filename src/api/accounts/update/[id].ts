/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PATCH") {
    const api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
      withCredentials: true,
    });

    // 🔑 Exclude initialBalance from payload
    const { initialBalance, ...rest } = req.body;

    api
      .patch(`/accounts/${req.query.id}`, rest, {
        headers: {
          Authorization: req.headers.authorization, // ✅ forward token
        },
      })
      .then((response) => {
        res.status(200).json({ success: true, data: response.data });
      })
      .catch((error) => {
        console.error("Error updating account:", error.response?.data || error);
        res.status(error.response?.status || 500).json({
          success: false,
          message:
            error.response?.data?.message ||
            "An error occurred while updating the account.",
        });
      });
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
