const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { data, error } = await supabase
    .from("orders_counter")
    .select("count, limit_total")
    .eq("id", 1)
    .single();

  if (error) {
    return res.status(500).json({ error: "Failed to fetch count" });
  }

  res.status(200).json({
    count: data.count,
    limit: data.limit_total,
    remaining: data.limit_total - data.count
  });
};
