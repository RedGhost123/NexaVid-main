import { Request, Response } from "express";
import { paymentService } from "../services/payment.service";
import { stripeService } from "../services/stripe.service"; // Import Stripe Service
import { StripeService } from "../services/stripe.service";


export class PaymentController {
  // ✅ Process payment
  async processPayment(req: Request, res: Response) {
    try {
      const { userId, amount, paymentMethod, subscriptionPlan } = req.body;
      const paymentResult = await paymentService.processPayment(
        userId,
        amount,
        paymentMethod,
        subscriptionPlan
      );
      res.json({ success: true, message: "Payment successful", data: paymentResult });
    } catch (error) {
      console.error("Payment error:", error);
      res.status(500).json({ success: false, message: "Payment failed", error });
    }
  }

  // ✅ Get user transactions
  async getUserTransactions(req: Request, res: Response) {
    try {
      const userId = req.user.id; // Assuming authentication middleware sets `req.user`
      const transactions = await paymentService.getUserTransactions(userId);
      res.json({ success: true, data: transactions });
    } catch (error) {
      console.error("Transaction fetch error:", error);
      res.status(500).json({ success: false, message: "Failed to get transactions", error });
    }
  }

  // ✅ Stripe Checkout Session
  async createCheckout(req: Request, res: Response) {
    try {
      const { amount, type } = req.body; // 'subscription' or 'credits'
      const session = await stripeService.createCheckoutSession(req.user.id, amount, type);
      res.json({ success: true, sessionUrl: session.url });
    } catch (error) {
      console.error("Stripe Checkout Error:", error);
      res.status(500).json({ success: false, message: "Failed to create checkout session", error });
    }
  }
}

@Post('/webhook')
async handleStripeWebhook(@Req() req) {
  const sig = req.headers['stripe-signature'];

  try {
    const event = this.stripe.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata.userId;

      if (session.metadata.type === 'credits') {
        await this.userService.addCredits(userId, 100); // Add 100 credits
      } else {
        await this.userService.updateSubscription(userId, 'PRO'); // Upgrade to Pro
      }
    }
  } catch (err) {
    console.error(err);
  }
}

export const paymentController = new PaymentController();
