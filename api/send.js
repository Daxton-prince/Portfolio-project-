export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message } = req.body;
  const botToken = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;

  console.log("BOT_TOKEN exists?", !!botToken);
  console.log("CHAT_ID exists?", !!chatId);

  if (!botToken || !chatId) {
    return res.status(500).json({ error: "BOT_TOKEN or CHAT_ID not set" });
  }

  const text = `📩 New message from your portfolio:
Name: ${name}
Email: ${email}
Message: ${message}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown"
      }),
    });

    const data = await response.json();
    console.log("📡 Telegram API raw response:", data);

    if (!response.ok || !data.ok) {
      return res.status(500).json({ error: data.description || "Telegram error" });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("❌ Telegram API Error:", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}
