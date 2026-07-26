import Stripe from 'stripe';

function createStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required.');
  }
  return new Stripe(key, {
    apiVersion: '2026-06-24.dahlia',
    appInfo: {
      name: 'Officia MENA',
      version: '0.1.0'
    }
  });
}

let _stripe: Stripe | null = null;
export const stripe = new Proxy<Stripe>({} as Stripe, {
  get(_, prop) {
    if (!_stripe) _stripe = createStripe();
    return Reflect.get(_stripe, prop);
  },
});
