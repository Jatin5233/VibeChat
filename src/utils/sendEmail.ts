import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // or use host/port for other providers
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function sendEmail(to: string, subject: string, url: string) {
  try {
    await transporter.sendMail({
      from: `"VibeChat" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: `Reset your password by clicking this link: ${url}`, // fallback for clients that don't support HTML
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.5;">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password. Click the button below to continue:</p>
          <a href="${url}" 
             style="display:inline-block;padding:10px 20px;background:#4f46e5;color:white;text-decoration:none;border-radius:6px;font-weight:bold;">
             Reset Password
          </a>
          <p style="margin-top:20px;font-size:12px;color:#666;">
            If the button doesn’t work, copy and paste this link into your browser:<br />
            <a href="${url}">${url}</a>
          </p>
        </div>
      `,
    });

    console.log("✅ Email sent to:", to);
  } catch (err) {
    console.error("❌ Email send failed:", err);
    throw err;
  }
}
