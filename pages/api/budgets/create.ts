import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // console.log("Creating budget with data:", req.body);

    const payload ={
      name: req.body.name,
      category: req.body.category,
      amount: parseFloat(req.body.amount), // number
      period: req.body.period, // string
      startDate: req.body.startDate ? new Date(req.body.startDate).toISOString() : new Date().toISOString(),
      endDate: req.body.endDate ? new Date(req.body.endDate).toISOString() : new Date().toISOString(),
    }
    console.log("Payload for budget creation:", payload);
    const api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL, // http://localhost:5000/api/v1
      withCredentials: true,
    });
    api
      .post("/budgets", payload, {
        headers: {
          Authorization: req.headers.authorization, // ✅ forward token
        },
      })
      .then((response) => {
        res.status(201).json({ success: true, data: response.data });
      })
      .catch((error) => {
        // console.error("Error creating budget:", error.response);

        res.status(error.response?.status || 500).json({
          success: false,
          message:
            error.response?.data?.message ||
            "An error occurred while creating the budget.",
        });
      });
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}