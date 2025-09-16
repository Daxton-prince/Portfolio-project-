// api/send.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, email, whatsapp, message } = req.body;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      throw new Error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
    }

    const text = `
📩 New Portfolio Message:
👤 Name: ${name}
📧 Email: ${email}
📱 WhatsApp: ${whatsapp}
💬 Message: ${message}
    `;

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const telegramRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    const data = await telegramRes.json();

    if (!data.ok) {
      throw new Error(JSON.stringify(data));
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Telegram Error:", err);
    res.status(500).json({ error: 'Failed to send message' });
  }
}
