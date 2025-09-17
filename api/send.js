export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message } = req.body;
  const botToken = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(500).json({ error: "BOT_TOKEN or CHAT_ID not set" });
  }

  const text = `📩 New message from your portfolio:\nName: ${name}\nEmail: ${email}\nMessage: ${message}`;

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    const data = await tgRes.json();

    if (!data.ok) {
      // send Telegram error back to the frontend
      return res.status(500).json({ error: data.description });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Telegram API Error:", err);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
}
