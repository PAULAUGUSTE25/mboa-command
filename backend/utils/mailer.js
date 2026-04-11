const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(to, otp, name = '') {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#0B0C10;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr><td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background:#161920;border-radius:20px;border:1px solid #2A2D3A;overflow:hidden;">

            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#0D2010,#1a3a1a);padding:32px;text-align:center;border-bottom:1px solid #2A2D3A;">
                <div style="font-size:32px;font-weight:900;color:#ffffff;letter-spacing:-1px;">
                  Mboa <span style="color:#A8FF3E;">Command</span>
                </div>
                <p style="color:#9CA3AF;margin:8px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Code de vérification</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px 32px;">
                <p style="color:#9CA3AF;font-size:15px;margin:0 0 8px;">Bonjour${name ? ` <strong style="color:#fff">${name}</strong>` : ''},</p>
                <p style="color:#9CA3AF;font-size:15px;margin:0 0 32px;line-height:1.6;">
                  Voici votre code OTP pour confirmer votre identité sur <strong style="color:#A8FF3E;">Mboa Command</strong>.
                  Ce code expire dans <strong style="color:#fff;">10 minutes</strong>.
                </p>

                <!-- OTP Block -->
                <div style="background:#0B0C10;border:2px solid #A8FF3E;border-radius:16px;padding:28px;text-align:center;margin-bottom:32px;">
                  <div style="font-size:48px;font-weight:900;letter-spacing:12px;color:#A8FF3E;font-family:monospace;">${otp}</div>
                </div>

                <p style="color:#4B5060;font-size:13px;margin:0;line-height:1.6;text-align:center;">
                  Si vous n'avez pas demandé ce code, ignorez cet e-mail.<br>
                  Ne partagez jamais ce code avec quelqu'un.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #2A2D3A;text-align:center;">
                <p style="color:#4B5060;font-size:12px;margin:0;">🇨🇲 Mboa Command — La saveur du Cameroun, livrée</p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Mboa Command" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${otp} — Votre code de vérification Mboa Command`,
    html,
  });
}

module.exports = { generateOTP, sendOTPEmail };
