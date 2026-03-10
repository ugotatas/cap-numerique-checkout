const express = require('express');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();
const PORT = process.env.PORT || 3000;

// IMPORTANT : Render est derrière un proxy, sans ça req.protocol = "http" au lieu de "https"
app.set('trust proxy', 1);

app.use(express.static('public'));
app.use(express.json());

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
app.get('/cible1', (req, res) => res.sendFile(path.join(__dirname, 'public', 'cible1.html')));
app.get('/cible2', (req, res) => res.sendFile(path.join(__dirname, 'public', 'cible2.html')));
app.get('/commande', (req, res) => res.sendFile(path.join(__dirname, 'public', 'commande.html')));
app.get('/commande2', (req, res) => res.sendFile(path.join(__dirname, 'public', 'commande2.html')));
app.get('/merci', (req, res) => res.sendFile(path.join(__dirname, 'public', 'merci.html')));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
