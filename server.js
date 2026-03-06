const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (the HTML order page)
app.use(express.static('public'));

// Create Checkout Session
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
                    unit_amount: 2700, // 27€ in cents
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
        console.error('Error creating session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Check session status (for return page)
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

// Thank you page
app.get('/merci', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'merci.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
