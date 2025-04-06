import { useState } from "react";

const AccountOverview = () => {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (amount: number, type: "credits" | "subscription") => {
    setLoading(true);
    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, type }),
      });

      if (!res.ok) throw new Error("Failed to create checkout session");

      const { url } = await res.json();
      window.location.href = url;
    } catch (error) {
      alert("Payment failed. Please try again.");
      console.error("Stripe Checkout Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Subscription: Free</h2>
      <h3>Credits: 10</h3>

      <button onClick={() => handlePurchase(10, "credits")} disabled={loading}>
        Buy 10 Credits ($10)
      </button>
      <button onClick={() => handlePurchase(30, "subscription")} disabled={loading}>
        Upgrade to Pro ($30/month)
      </button>

      {loading && <p>Redirecting to Stripe...</p>}
    </div>
  );
};

export default AccountOverview;
