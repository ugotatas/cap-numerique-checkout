const express = require('express');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// Checkout session for Cible 1
app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'Le Défi ChatGPT · 30 jours',
                        description: '30 leçons quotidiennes + exercices pratiques + accès à vie',
                    },
                    unit_amount: 2700,
                },
                quantity: 1,
            }],
            mode: 'payment',
            ui_mode: 'embedded',
            return_url: `${req.protocol}://${req.get('host')}/merci?session_id={CHECKOUT_SESSION_ID}`,
            customer_creation: 'always',
            payment_method_types: ['card', 'paypal'],
            metadata: {
                product: 'defi-chatgpt-30j',
            },
        });
        res.json({ clientSecret: session.client_secret });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Checkout session for Cible 2 (same product, different metadata for tracking)
app.post('/create-checkout-session-2', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'Le Défi ChatGPT · 30 jours',
                        description: '30 leçons quotidiennes + exercices pratiques + accès à vie',
                    },
                    unit_amount: 2700,
                },
                quantity: 1,
            }],
            mode: 'payment',
            ui_mode: 'embedded',
            return_url: `${req.protocol}://${req.get('host')}/merci?session_id={CHECKOUT_SESSION_ID}`,
            customer_creation: 'always',
            payment_method_types: ['card', 'paypal'],
            metadata: {
                product: 'defi-chatgpt-30j',
                cible: 'senior',
            },
        });
        res.json({ clientSecret: session.client_secret });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

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

// Routes
app.get('/cible1', (req, res) => res.sendFile(path.join(__dirname, 'public', 'cible1.html')));
app.get('/cible2', (req, res) => res.sendFile(path.join(__dirname, 'public', 'cible2.html')));
app.get('/commande', (req, res) => res.sendFile(path.join(__dirname, 'public', 'commande.html')));
app.get('/commande2', (req, res) => res.sendFile(path.join(__dirname, 'public', 'commande2.html')));
app.get('/merci', (req, res) => res.sendFile(path.join(__dirname, 'public', 'merci.html')));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
