import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, whatsapp, message } = req.body;

  const botToken = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!botToken || !chatId) {
    return res.status(500).json({ error: "BOT_TOKEN or CHAT_ID not set" });
  }

  const text = `📩 New message from portfolio:
Name: ${name}
Email: ${email}
WhatsApp: ${whatsapp}
Message: ${message}`;

  try {
    // ✅ Send to Telegram
    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }), // built-in JSON
    });

    const tgData = await tgRes.json();
    if (!tgData.ok) {
      return res.status(500).json({ error: tgData.description });
    }

    // ✅ Send to Gmail (if email creds are set)
    if (emailUser && emailPass) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: emailUser,
          pass: emailPass, // your 16-char Google App Password
        },
      });

      await transporter.sendMail({
        from: `"Portfolio Bot" <${emailUser}>`,
        to: emailUser,
        subject: "New Portfolio Contact Message",
        text,
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}
