// /api/sendMessage.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if(req.method === 'POST'){
    const { name, email, message } = req.body;

    if(!name || !email || !message){
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const telegramBotToken = 'YOUR_TELEGRAM_BOT_TOKEN';
    const chatId = 'YOUR_TELEGRAM_CHAT_ID';
    const text = `New Message from Portfolio:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`;

    try {
      const telegramResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text })
      });

      const data = await telegramResponse.json();

      if(data.ok){
        res.status(200).json({ success: true });
      } else {
        res.status(500).json({ success: false, error: 'Telegram API failed' });
      }

    } catch(err){
      console.error(err);
      res.status(500).json({ success: false, error: 'Server error' });
    }

  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
