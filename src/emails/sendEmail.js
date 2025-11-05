import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: "singhpriyanshu62120@gmail.com",
    pass: "htxepsrvwqnhjivh",
  },
});

export const sendEmail = async (options) => {
  console.log(process.env.EMAIL_USER, "email user");
  console.log(process.env.EMAIL_PASS, "pass user");
  try {
    const mailOptions = {
      from: `"Priyanshu 👨‍💻" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || "",
      html: options.html || "",
      attachments: options.attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
};
