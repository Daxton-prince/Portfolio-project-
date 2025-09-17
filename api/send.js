import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, whatsapp, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // -----------------------
    // 1. SEND TO TELEGRAM
    // -----------------------
    const telegramMessage = `📩 New Portfolio Message:
👤 Name: ${name}
📧 Email: ${email}
📱 WhatsApp: ${whatsapp || "N/A"}
💬 Message: ${message}`;

    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: telegramMessage,
        }),
      }
    );

    // -----------------------
    // 2. SETUP EMAIL TRANSPORTER
    // -----------------------
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail
        pass: process.env.EMAIL_PASS, // Google App Password
      },
    });

    // -----------------------
    // 3. SEND EMAIL TO YOU
    // -----------------------
    await transporter.sendMail({
      from: `"Portfolio Bot" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // your own inbox
      subject: "📩 New Message from Portfolio Website",
      text: `You got a new message from your portfolio:

👤 Name: ${name}
📧 Email: ${email}
📱 WhatsApp: ${whatsapp || "N/A"}
💬 Message: ${message}`,
    });

    // -----------------------
    // 4. AUTO-REPLY TO USER (Optional)
    // -----------------------
    await transporter.sendMail({
      from: `"Daxton Portfolio" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "✅ Thanks for reaching out!",
      text: `Hello ${name},

Thank you for contacting me. I have received your message and will reply soon.

Your message was:
"${message}"

Regards,  
Daxton`,
    });

    return res.status(200).json({ success: true, message: "Sent to Telegram + Email" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Failed to send" });
  }
}
