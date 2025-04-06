import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { amount, type } = req.body;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: type === 'subscription' ? 'subscription' : 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: amount * 100,
              product_data: {
                name: type === 'subscription' ? 'NexaVid Subscription' : 'AI Credits',
              },
              recurring: type === 'subscription' ? { interval: 'month' } : undefined,
            },
            quantity: 1,
          },
        ],
        success_url: `${req.headers.origin}/payment-success`,
        cancel_url: `${req.headers.origin}/payment-cancel`,
      });

      res.status(200).json({ url: session.url });
    } catch (err) {
      console.error(err);
      res.status(500).json({ statusCode: 500, message: "Internal server error" });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
