export default async function handler(req, res) {
  console.log("BOT_TOKEN:", process.env.BOT_TOKEN ? "Loaded" : "Missing");
  console.log("CHAT_ID:", process.env.CHAT_ID);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, whatsapp, message } = req.body;

  try {
    const telegramRes = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.CHAT_ID,
        text: `📩 New Message:\nName: ${name}\nEmail: ${email}\nWhatsApp: ${whatsapp || 'N/A'}\nMessage: ${message}`
      })
    });

    const data = await telegramRes.json();
    console.log("Telegram response:", data); // 👈 log actual error
    if (!data.ok) {
      throw new Error(data.description || 'Telegram API error');
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Telegram Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
