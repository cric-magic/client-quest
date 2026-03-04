const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const getRawBody = require("micro").buffer;

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const buf = await getRawBody(req);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf, sig, process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send("Webhook Error: " + err.message);
  }

  if (event.type === "checkout.session.completed") {
    const { data, error } = await supabase.rpc("increment_order");

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to increment" });
    }

    console.log("Order count incremented to:", data);
  }

  res.status(200).json({ received: true });
};
