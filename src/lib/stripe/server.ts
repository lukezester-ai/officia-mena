import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_dummy_build_key', {
  apiVersion: '2026-06-24.dahlia',
  appInfo: {
    name: 'Officia MENA',
    version: '0.1.0'
  }
});
