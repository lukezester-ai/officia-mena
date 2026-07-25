import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required.');
}

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2026-06-24.dahlia',
  appInfo: {
    name: 'Officia MENA',
    version: '0.1.0'
  }
});
