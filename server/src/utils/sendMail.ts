import nodemailer from "nodemailer"
import "dotenv/config"

export const sendMail : any = async (data: any)=>{
    // 

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
        user: <string>process.env.NODEMAILER_EMAIL_ADDRESS,
        pass: <string>process.env.NODEMAILER_EMAIL_PASSWORD
        },
    });

    // let mailOptions = {
    //   from: 'your-email@your-domain.com',
    //   to: 'recipient-email@example.com',
    //   subject: 'Test Email',
    //   text: 'Hello, this is a test email sent from Node.js using my own SMTP server!',
    // };

    // // Send the email
    // let info = await transporter.sendMail(mailOptions);

    // send mail with defined transport object
    const info: any = await transporter.sendMail(data);

    console.log(info, "info")
}