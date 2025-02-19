import * as nodemailer from 'nodemailer';

export const sendEMail = async(email: string, hashedToken: any, task:string ) => {
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
                    subject: `${task==="verification"?"Verify your email":"Reset Your Password"}`,
                    html: `<p>${task==="verification"?"Please verify your email by clicking the following link:":"Reset your password by clicking on the following link"}</p><a href="http://localhost:4000/${task==="verification"?"verification":"reset-password"}?token=${hashedToken}&email=${email}">${task==="verification"?"Verify Your Email":"Reset Your Password"}</a>`
                };
        
                await transport.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        
    }

}