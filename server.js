const express = require('express');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();
const PORT = process.env.PORT || 3000;

// IMPORTANT : Render est derrière un proxy, sans ça req.protocol = "http" au lieu de "https"
app.set('trust proxy', 1);

app.use(express.static('public'));
app.use(express.json());
// Désactive le cache navigateur/CDN pour les pages HTML critiques (mobile fixes)
const noCacheHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    Pragma: 'no-cache',
    Expires: '0',
    'Surrogate-Control': 'no-store',
};

function sendHtmlNoCache(res, fileName) {
    return res.set(noCacheHeaders).sendFile(path.join(__dirname, 'public', fileName));
}

// === CHECKOUT SESSION CIBLE 1 (salariés 40-60) ===
app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [{
                price: 'price_1T9QouChA9z5X7DG3gxfGhxe',
                quantity: 1,
            }],
            mode: 'payment',
            ui_mode: 'embedded',
            // URL absolue en HTTPS (obligatoire pour Stripe)
            return_url: 'https://cap-numerique.onrender.com/merci?session_id={CHECKOUT_SESSION_ID}',
            customer_creation: 'always',
            // PAS de payment_method_types ici = Stripe active TOUT automatiquement :
            // Carte, PayPal, Apple Pay, Google Pay, Link, etc.
            metadata: {
                product: 'defi-chatgpt-30j',
                cible: 'salarie',
            },
        });

        res.json({ clientSecret: session.client_secret });
    } catch (error) {
        console.error('Stripe error (cible1):', error.message);
        res.status(500).json({ error: error.message });
    }
});

// === CHECKOUT SESSION CIBLE 2 (seniors 55-80) ===
app.post('/create-checkout-session-2', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [{
                price: 'price_1T9QouChA9z5X7DG3gxfGhxe',
                quantity: 1,
            }],
            mode: 'payment',
            ui_mode: 'embedded',
            return_url: 'https://cap-numerique.onrender.com/merci?session_id={CHECKOUT_SESSION_ID}',
            customer_creation: 'always',
            // PAS de payment_method_types ici = Stripe active TOUT automatiquement :
            // Carte, PayPal, Apple Pay, Google Pay, Link, etc.
            metadata: {
                product: 'defi-chatgpt-30j',
                cible: 'senior',
            },
        });

        res.json({ clientSecret: session.client_secret });
    } catch (error) {
        console.error('Stripe error (cible2):', error.message);
        res.status(500).json({ error: error.message });
    }
});

// === STATUS CHECK (pour page merci) ===
app.get('/session-status', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
        res.json({
            status: session.status,
            customer_email: session.customer_details?.email,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === ROUTES PAGES ===
app.get('/cible1', (req, res) => sendHtmlNoCache(res, 'cible1.html'));
app.get('/cible2', (req, res) => sendHtmlNoCache(res, 'cible2.html'));
app.get('/commande', (req, res) => sendHtmlNoCache(res, 'commande.html'));
app.get('/commande2', (req, res) => sendHtmlNoCache(res, 'commande2.html'));
app.get('/cgv', (req, res) => sendHtmlNoCache(res, 'cgv.html'));
app.get('/mentions-legales', (req, res) => sendHtmlNoCache(res, 'mentions-legales.html'));
app.get('/confidentialite', (req, res) => sendHtmlNoCache(res, 'confidentialite.html'));
app.get('/merci', (req, res) => sendHtmlNoCache(res, 'merci.html'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
