import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    console.log("Raw request body:", req.body);

    // Try the absolute minimal payload first
    const payload = {
      fromAccountId: req.body.fromAccountId,
      toAccountId: req.body.toAccountId,
      amount: parseFloat(req.body.amount), // number
      description: req.body.description || "", // string
      exchangeRate: parseFloat(req.body.exchangeRate) || 1, // number
      fees: parseFloat(req.body.fees) || 0, // number
      transactionDate: req.body.transactionDate
        ? new Date(req.body.transactionDate).toISOString()
        : new Date().toISOString(),
    };

    console.log("Minimal payload:", payload);

    const api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      withCredentials: true,
    });

    api
      .post("/transactions/transfer", payload, {
        headers: {
          Authorization: req.headers.authorization,
          "Content-Type": "application/json", // Ensure proper content type
        },
      })
      .then((response) => {
        res.status(201).json({ success: true, data: response.data });
      })
      .catch((error) => {
        console.error(
          "Error transferring funds:",
          error.response?.data || error.message
        );

        // More detailed error logging
        if (error.response) {
          console.error("Status:", error.response.status);
          console.error("Headers:", error.response.headers);
          console.error("Data:", error.response.data);
        }

        res.status(error.response?.status || 500).json({
          success: false,
          message:
            error.response?.data?.message ||
            "An error occurred while transferring funds.",
          // Include validation errors if they exist
          errors: error.response?.data?.errors || error.response?.data?.message,
        });
      });
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
