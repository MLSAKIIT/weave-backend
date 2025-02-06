import * as nodemailer from 'nodemailer';

export const sendEMail = async(email: string, hashedToken: any ) => {
    try {
         var transport = nodemailer.createTransport({
                    host: "sandbox.smtp.mailtrap.io",
                    port: 2525,
                    auth: {
                        user: Bun.env.MAIL_USERNAME,
                        pass: Bun.env.MAIL_PASSWORD
                    }
                });
                
        
                const mailOptions = {
                    from: 'mlsa@gmail.com',
                    to: email,
                    subject: 'Verify your email',
                    html: `<p>Please verify your email by clicking the following link:</p><a href="http://localhost:${Bun.env.PORT}/api/v1/user/verify-email?token=${hashedToken}&email=${email}">Verify Email</a>`
                };
        
                await transport.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        
    }

}