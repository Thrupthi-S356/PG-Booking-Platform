const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

transporter.verify((err) => {
  if (err) console.error('❌ Nodemailer error:', err.message);
  else     console.log('✅ Nodemailer ready');
});

const sendContactEmail = async ({ name, email, subject, message }) => {
  await transporter.sendMail({
    from: `"PGFinder App" <${process.env.GMAIL_USER}>`,
    to: process.env.SUPPORT_EMAIL,
    replyTo: email,
    subject: `[PGFinder] ${subject || 'New Issue Reported'}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#6366f1;padding:24px 32px;">
          <h2 style="color:#fff;margin:0;">New Issue from PGFinder</h2>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#6b7280;width:100px;">Name</td>
              <td style="padding:8px 0;font-weight:600;color:#111827;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;">Email</td>
              <td style="padding:8px 0;"><a href="mailto:${email}" style="color:#6366f1;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;">Subject</td>
              <td style="padding:8px 0;color:#111827;">${escapeHtml(subject || 'No subject')}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;vertical-align:top;">Message</td>
              <td style="padding:8px 0;color:#374151;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</td>
            </tr>
          </table>
        </div>
        <div style="padding:12px 32px;background:#f9fafb;font-size:12px;color:#9ca3af;text-align:center;">
          Sent on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
        </div>
      </div>
    `,
  });
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { sendContactEmail };