// BLEXX SPELLBINDER — Cloud Functions (Stripe kit checkout + notifications)
// Ported from the Publicide zine press pattern. Deploy AFTER setting secrets:
//   firebase functions:secrets:set STRIPE_SECRET_KEY
//   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
//   firebase functions:secrets:set SMTP_URL
//   firebase deploy --only functions
//
// Price lives HERE and only here. No card data ever touches the site.

const { onRequest } = require('firebase-functions/v2/https');
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

admin.initializeApp();

const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET');
const SMTP_URL = defineSecret('SMTP_URL');

const PRICE_USD_CENTS = 2000;   // $20 flat — the only place the price exists
const NOTIFY_EMAIL = 'dusty@publicide.com';
const SITE_URL = 'https://bitsofdust.github.io/blexx-spellbinder';

// POST { orderId } -> { url } (Stripe Checkout redirect)
exports.createCheckoutSession = onRequest(
  { secrets: [STRIPE_SECRET_KEY], cors: true },
  async (req, res) => {
    try {
      if (req.method !== 'POST') return res.status(405).send('POST only');
      const { orderId } = req.body || {};
      if (!orderId) return res.status(400).json({ error: 'orderId required' });

      const orderRef = admin.firestore().collection('orders').doc(orderId);
      const order = await orderRef.get();
      if (!order.exists) return res.status(404).json({ error: 'unknown order' });

      const stripe = require('stripe')(STRIPE_SECRET_KEY.value());
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: PRICE_USD_CENTS,
            product_data: {
              name: 'BLEXX Spell Kit — ' + (order.data().spellId || 'bound spell'),
              description: 'Kit components + printed spellbook page + house card + BLEXX keychain',
            },
          },
        }],
        shipping_address_collection: { allowed_countries: ['US', 'CA'] },
        success_url: SITE_URL + '/?order=sealed',
        cancel_url: SITE_URL + '/?order=released',
        metadata: { orderId },
      });
      await orderRef.update({ stripeSessionId: session.id, status: 'checkout' });
      res.json({ url: session.url });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'checkout failed' });
    }
  });

// Stripe webhook -> mark order paid
exports.stripeWebhook = onRequest(
  { secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET] },
  async (req, res) => {
    const stripe = require('stripe')(STRIPE_SECRET_KEY.value());
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody, req.headers['stripe-signature'], STRIPE_WEBHOOK_SECRET.value());
    } catch (e) {
      return res.status(400).send('bad signature');
    }
    if (event.type === 'checkout.session.completed') {
      const orderId = event.data.object.metadata && event.data.object.metadata.orderId;
      if (orderId) {
        await admin.firestore().collection('orders').doc(orderId).update({
          status: 'paid',
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          shipping: event.data.object.shipping_details || null,
        });
      }
    }
    res.json({ received: true });
  });

// Email dusty@ on order create + paid
async function notify(subject, body, smtpUrl) {
  const nodemailer = require('nodemailer');
  const transport = nodemailer.createTransport(smtpUrl);
  await transport.sendMail({
    from: 'The Spellbinder <' + NOTIFY_EMAIL + '>',
    to: NOTIFY_EMAIL, subject, text: body,
  });
}

exports.orderNotify = onDocumentCreated(
  { document: 'orders/{orderId}', secrets: [SMTP_URL] },
  async (event) => {
    const d = event.data.data();
    await notify('BLEXX kit order intent — ' + (d.spellId || '?'),
      'New order ' + event.params.orderId + ' for spell ' + d.spellId, SMTP_URL.value());
  });

exports.orderPaidNotify = onDocumentUpdated(
  { document: 'orders/{orderId}', secrets: [SMTP_URL] },
  async (event) => {
    const before = event.data.before.data(), after = event.data.after.data();
    if (before.status !== 'paid' && after.status === 'paid') {
      await notify('BLEXX KIT PAID 💸 — ' + (after.spellId || '?'),
        'Order ' + event.params.orderId + ' paid.\nSpell: ' + after.spellId +
        '\nShipping: ' + JSON.stringify(after.shipping, null, 2), SMTP_URL.value());
    }
  });
