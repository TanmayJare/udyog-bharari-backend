
import transporter from '../config/email';

export const sendConfirmationEmail = async (
  email: string,
  name: string,
  ticketDetails: any[]
) => {
  const ticketsHtml = ticketDetails.map((ticket: any) => `
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0; background-color: #f9fafb;">
      <h3 style="margin: 0 0 8px 0; color: #1f2937;">Ticket #${ticket.ticketNumber}</h3>
      <p style="margin: 4px 0; color: #4b5563;"><strong>Name:</strong> ${ticket.name}</p>
      <p style="margin: 4px 0; color: #4b5563;"><strong>Type:</strong> ${ticket.ticketType}</p>
      <div style="margin-top: 12px;">
        <p style="margin: 0 0 8px 0; color: #4b5563; font-weight: 500;">QR Code for Entry:</p>
        <img src="${ticket.qrCodeImage}" alt="QR Code" style="max-width: 200px; border: 1px solid #d1d5db; border-radius: 4px;" />
      </div>
    </div>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '🎉 Your Event Registration Confirmation & Tickets',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Registration Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #374151;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 8px; text-align: center; color: white; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 24px;">🎉 Thank You for Registering!</h1>
        </div>
        
        <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="margin-top: 0; color: #1f2937; font-size: 20px;">Hi ${name},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Your payment is successful and your registration is confirmed! Below are your tickets with unique QR codes for event entry.
          </p>
          
          ${ticketsHtml}
          
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #6b7280; margin: 0;">We look forward to seeing you at the event!</p>
          </div>
        </div>
        
        <div style="margin-top: 24px; text-align: center; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">This email was sent to ${email}</p>
        </div>
      </body>
      </html>
    `,
  };
  return await transporter.sendMail(mailOptions);
};

export const sendOtpEmail = async (
  email: string,
  otp: string
) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Your OTP for Event Registration',
    html: `
      <h1>Your OTP Code</h1>
      <p>Your OTP for event registration is:</p>
      <h2 style="color: #3b82f6; font-size: 2rem; letter-spacing: 0.5rem;">${otp}</h2>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };
  return await transporter.sendMail(mailOptions);
};
