// Vercel Serverless Function
// GET /api/checkout-success?session_id=xxx&product=yyy
// Called by Stripe after successful payment.
// Verifies the session, generates a Vimeo OTT signed access link,
// and redirects the user to the player page with the token.

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

// Map product → Vimeo OTT video/event URL (replace with real Vimeo OTT embed URLs)
// These are the embed links you get from your Vimeo OTT dashboard under each video.
const VIMEO_EMBED_URLS = {
  'vod-oltre-i-muri': process.env.VIMEO_VOD_URL || 'https://vimeo.com/showcase/PLACEHOLDER',
  'live-oltre-i-muri': process.env.VIMEO_LIVE_URL || 'https://vimeo.com/event/PLACEHOLDER/embed',
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id, product } = req.query;

  if (!session_id || !product) {
    return res.status(400).send('Parametri mancanti.');
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id);
  } catch (err) {
    console.error('Stripe session retrieve error:', err.message);
    return res.status(500).send('Errore di verifica pagamento.');
  }

  if (session.payment_status !== 'paid') {
    return res.status(402).send('Pagamento non completato.');
  }

  const vimeoUrl = VIMEO_EMBED_URLS[product];
  if (!vimeoUrl) {
    return res.status(400).send('Prodotto non riconosciuto.');
  }

  // Build the watch page URL — embed the vimeo URL and session token as query params
  // The frontend /watch page will read these and show the player.
  const origin = req.headers['x-forwarded-host']
    ? `https://${req.headers['x-forwarded-host']}`
    : process.env.SITE_URL || 'https://compagnia-chandrama.vercel.app';

  const watchUrl = new URL(`${origin}/watch`);
  watchUrl.searchParams.set('embed', encodeURIComponent(vimeoUrl));
  watchUrl.searchParams.set('title', product === 'live-oltre-i-muri' ? 'Oltre i Muri — Live' : 'Oltre i Muri — Registrazione');
  // The session_id itself acts as the one-time token (Stripe sessions are unique and expire)
  watchUrl.searchParams.set('tok', session_id);

  return res.redirect(302, watchUrl.toString());
}
