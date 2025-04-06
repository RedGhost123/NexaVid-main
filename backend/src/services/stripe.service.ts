import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

type PaymentType = 'subscription' | 'credits';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2023-10-16',
    });
  }

  async createCheckoutSession(
    userId: string,
    amount: number,
    type: PaymentType,
  ): Promise<string> {
    const isSubscription = type === 'subscription';

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: isSubscription ? 'subscription' : 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: isSubscription ? 'NexaVid Subscription' : 'AI Credits',
            },
            unit_amount: amount * 100, // Stripe uses cents
            recurring: isSubscription ? { interval: 'month' } : undefined,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        type,
      },
      success_url: `${process.env.FRONTEND_URL}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
    });

    return session.url!;
  }
}
