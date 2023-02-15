import nodemailer from "nodemailer";
import mailConfig from "../config/mail-config.json" assert { type: "json" };
import ejs from "ejs";
import path from "path";
const __dirname = path.resolve();

const MailService = {
  async sendMail(toEmail, authNumber) {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      prot: 587,
      host: "smtp.gmlail.com",
      secure: false,
      requireTLS: true,
      auth: {
        user: mailConfig.user,
        pass: mailConfig.pass,
      },
    });

    ejs.renderFile(
      __dirname + "/service/template.ejs",
      { authNumber },
      (err, data) => {
        if (err) {
          throw err;
        } else {
          var mailOptions = {
            from: mailConfig.user,
            to: toEmail,
            subject: "[Comeet] 인증 이메일 입니다",
            text:
              "<a href>" +
              mailConfig.host +
              mailConfig.user +
              "?" +
              authNumber +
              "</a>",
            html: data,
          };

          transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
              console.log(err);
              throw err;
            } else {
              console.log("Email sent: " + info.response);
            }
          });
        }
      }
    );
  },
};

export default MailService;
