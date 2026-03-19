// Vercel Serverless Function
// POST /api/create-checkout
// Body: { productId: string, priceAmount: number, title: string }
// Returns: { url: string } — Stripe Checkout session URL

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

// Map of known product IDs to their configuration
const PRODUCTS = {
  'vod-oltre-i-muri': {
    title: 'Oltre i Muri — Registrazione',
    price: 500, // cents (€5.00)
    mode: 'payment',
    successPath: '/api/checkout-success',
  },
  'live-oltre-i-muri': {
    title: 'Oltre i Muri — Live Streaming',
    price: 800, // cents (€8.00)
    mode: 'payment',
    successPath: '/api/checkout-success',
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productId } = req.body || {};
  const product = PRODUCTS[productId];

  if (!product) {
    return res.status(400).json({ error: 'Prodotto non trovato' });
  }

  const origin = req.headers.origin || process.env.SITE_URL || 'https://compagnia-chandrama.vercel.app';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: product.title,
              description: 'Compagnia Chāndrama',
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      mode: product.mode,
      // After payment, Stripe redirects here — our webhook generates the Vimeo token
      success_url: `${origin}${product.successPath}?session_id={CHECKOUT_SESSION_ID}&product=${productId}`,
      cancel_url: `${origin}/#streaming`,
      metadata: {
        productId,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    return res.status(500).json({ error: 'Errore nella creazione del pagamento' });
  }
}
