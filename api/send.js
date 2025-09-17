import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, whatsapp, message } = req.body;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(500).json({ error: 'Missing Telegram credentials' });
  }

  const text = `📩 New Portfolio Message

👤 Name: ${name}
📧 Email: ${email}
📱 WhatsApp: ${whatsapp || 'Not provided'}
💬 Message: ${message}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    const data = await response.json();

    if (!data.ok) {
      return res.status(500).json({ error: data.description || 'Telegram API error' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Telegram API Error:', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
