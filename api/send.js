// api/send.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, whatsapp, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Missing fields' });
  }

  try {
    const telegramRes = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.CHAT_ID,
        text: `📩 New Message from Portfolio:\n\n👤 Name: ${name}\n📧 Email: ${email}\n📱 WhatsApp: ${whatsapp || 'N/A'}\n💬 Message: ${message}`
      })
    });

    const data = await telegramRes.json();

    if (!data.ok) {
      throw new Error(data.description || 'Telegram API error');
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Telegram Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
