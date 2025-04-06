import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export const config = {
  api: {
    bodyParser: false, // Stripe requires the raw body for verification
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  let event;
  const sig = req.headers["stripe-signature"]!;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook Error:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle different event types
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;

      console.log(`✅ Payment successful for user: ${session.metadata?.userId}`);

      if (session.metadata?.type === "credits") {
        // Add credits to user
        console.log("🟢 Adding credits to user...");
      } else {
        // Update subscription plan
        console.log("🔵 Upgrading user subscription...");
      }
      break;

    case "invoice.payment_succeeded":
      console.log("🔄 Subscription payment succeeded!");
      break;

    case "invoice.payment_failed":
      console.log("❌ Subscription payment failed. Alerting user...");
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
}
