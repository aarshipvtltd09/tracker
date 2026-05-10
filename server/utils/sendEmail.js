const sendEmail = async (options) => {
  if (!process.env.BREVO_API_KEY) {
    console.error('❌ FATAL Email Error: BREVO_API_KEY environment variable is missing.');
    throw new Error('Email credentials missing');
  }

  const payload = {
    sender: {
      name: 'Tracker App',
      email: process.env.EMAIL_USER || 'aarshipvtltd@gmail.com'
    },
    to: [
      { email: options.email }
    ],
    subject: options.subject,
    htmlContent: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #6366f1;">Verification Code</h2>
        <p>Your code is: <b style="font-size: 24px;">${options.otp}</b></p>
        <p>Valid for 10 minutes.</p>
      </div>
    `
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Brevo API Error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('✅ OTP Email Sent Successfully via Brevo to:', options.email);
    console.log('Message ID:', data.messageId);
    return data;
  } catch (error) {
    console.error('❌ FATAL Email Error:', error.message);
    throw error;
  }
};

module.exports = sendEmail;
