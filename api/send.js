export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, whatsapp, message } = req.body;

  const botToken = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailUser = process.env.EMAIL_USER; // your receiving email

  if (!botToken || !chatId) {
    return res.status(500).json({ error: "BOT_TOKEN or CHAT_ID not set" });
  }

  const text = `📩 New message from portfolio:
Name: ${name}
Email: ${email}
WhatsApp: ${whatsapp}
Message: ${message}`;

  try {
    // ✅ Send Telegram message
    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    const tgData = await tgRes.json();
    if (!tgData.ok) {
      return res.status(500).json({ error: tgData.description });
    }

    // ✅ Send Email via Resend REST API
    if (resendApiKey && emailUser) {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Portfolio Bot <onboarding@resend.dev>",
          to: [emailUser],
          subject: "New Portfolio Contact Message",
          text,
        }),
      });

      if (!emailRes.ok) {
        const errData = await emailRes.json();
        return res.status(500).json({ error: errData });
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}
