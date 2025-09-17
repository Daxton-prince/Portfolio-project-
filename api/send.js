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
    const telegramMessage = `📩 New Message:
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
    // 2. SEND EMAIL REPLY TO USER
    // -----------------------
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS, // App Password from Google
      },
    });

    await transporter.sendMail({
      from: `"Your Portfolio" <${process.env.EMAIL_USER}>`,
      to: email, // send reply to the visitor
      subject: "Thanks for contacting me!",
      text: `Hello ${name},

Thank you for reaching out! I have received your message:

"${message}"

I will get back to you soon.
Best regards,
Daxton
`,
    });

    return res.status(200).json({ success: true, message: "Sent to Telegram + Email" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Failed to send" });
  }
}
