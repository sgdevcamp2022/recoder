import { createTransport } from "nodemailer";

export async function mailService(req, res) {
  const transporter = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "email",
      pass: "pass",
    },
    tls: { rejectUnauthorized: false },
  });

  const mailOptions = {
    from: "email",
    to: req.body.email,
    subject: "subject",
    text: "text",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.json(error);
    } else {
      res.json("send email: " + info.response);
    }
  });
}
