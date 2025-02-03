import * as nodemailer from 'nodemailer';

export const sendEMail = async(email: any, hashedToken: any ) => {
    try {
         var transport = nodemailer.createTransport({
                    host: "sandbox.smtp.mailtrap.io",
                    port: 2525,
                    auth: {
                        user: "9167ce5cb37411",
                        pass: "71ef912b7cb960"
                    }
                });
                
        
                const mailOptions = {
                    from: 'mlsa@gmail.com',
                    to: email,
                    subject: 'Verify your email',
                    html: `<p>Please verify your email by clicking the following link:</p><a href="http://localhost:3000/verify-email?token=${hashedToken}">Verify Email</a>`
                };
        
                await transport.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        
    }

}