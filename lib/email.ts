import nodemailer from "nodemailer";

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

export async function sendPasswordResetEmail(recipient: string, resetUrl: string) {
  if (!smtpConfigured()) return false;

  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD || "" }
      : undefined,
  });

  const configuredSiteName = process.env.NEXT_PUBLIC_SITE_NAME?.trim();
  const siteName = !configuredSiteName || /^Atlas Learning/i.test(configuredSiteName) ? "4Z Academy" : configuredSiteName;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: recipient,
    subject: `${siteName} password reset`,
    text: `Use this secure link within 30 minutes to reset your password: ${resetUrl}`,
    html: `<p>Use the secure link below within 30 minutes to reset your password.</p><p><a href="${resetUrl}">Reset password</a></p><p>If you did not request this, ignore this email.</p>`,
  });
  return true;
}
