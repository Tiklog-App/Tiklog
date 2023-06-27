import nodemailer from "nodemailer"
import settings from "../config/settings";

class SendMailService {
    private nodemailerConfig = {
        service: settings.nodemailer.service,
        user: settings.nodemailer.email,
        pass: settings.nodemailer.password
    };

    private transporter = nodemailer.createTransport ({
        service: this.nodemailerConfig.service,
        auth: {
            user: this.nodemailerConfig.user,
            pass: this.nodemailerConfig.pass
        }
    })

    public sendMail(data: any): Promise<any> {
        return new Promise((resolve, reject) => {
          this.transporter.sendMail(data, (error, info) => {
            if (error) {
              reject(error);
            } else {
              resolve(info);
            }
          });
        });
      }
};

export default SendMailService;