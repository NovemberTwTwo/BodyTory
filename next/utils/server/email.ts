import nodemailer from "nodemailer";

const smtpTransport = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  auth: {
    user: process.env.MAIL_ID,
    pass: process.env.MAIL_PASSWORD,
  },
  secure: true,
  // tls: {
  //   rejectUnauthorized: false,
  // },
});

export default smtpTransport;
