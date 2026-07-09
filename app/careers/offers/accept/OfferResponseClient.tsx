"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function OfferResponseClient({ token }: { token: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleAction = async (action: "accept" | "reject") => {
    if (!confirm(`Are you sure you want to ${action} this offer? This action cannot be undone.`)) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/recruitment/offers/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }
      
      setStatus("success");
      setMessage(data.message || "Thank you. Your response has been recorded.");
    } catch (err: unknown) {
      setStatus("error");
      setMessage((err as Error).message);
    }
  };

  if (status === "success") {
    return (
      <div className="bg-green-900/30 text-green-400 p-4 rounded-lg text-center border border-green-800">
        {message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {status === "error" && (
        <div className="text-red-400 text-sm text-center mb-4 bg-red-900/20 p-2 rounded border border-red-800">
          {message}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={() => handleAction("accept")}
          disabled={status === "loading"}
          className="bg-green-600 hover:bg-green-700 text-white flex-1"
        >
          {status === "loading" ? "Processing..." : "Accept Offer"}
        </Button>
        <Button 
          onClick={() => handleAction("reject")}
          disabled={status === "loading"}
          className="bg-red-600 hover:bg-red-700 text-white flex-1"
        >
          Decline Offer
        </Button>
      </div>
    </div>
  );
}
