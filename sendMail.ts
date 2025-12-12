import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer';

const transporter: Transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  secure: true,
  auth: {
    user: 'nourkhalifi74@gmail.com',
    pass: 'bkec jsgc lvvg diom',
  },
});

// async..await is not allowed in global scope, must use a wrapper
export async function sendMail(to: string, subject: string, text: string): Promise<void> {
  try {
    // send mail with defined transport object
    const info: SentMessageInfo = await transporter.sendMail({
      from: 'nourkhalifi74@gmail.com', // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
       // html body
    });

    console.log('Message sent: %s', info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
  } catch (error) {
    console.error('Error sending email:', error);
  }
}


