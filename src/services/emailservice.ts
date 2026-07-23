import fs from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";

const EMAIL_TEMPLATE_PATH = path.resolve(process.cwd(), "emails", "dist");

class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  /**
   * Load an HTML template and replace placeholders.
   */
  private async loadTemplate(
    template: string,
    variables: Record<string, string>,
  ) {
    const file = path.join(EMAIL_TEMPLATE_PATH, `${template}.html`);

    let html = await fs.readFile(file, "utf8");

    for (const [key, value] of Object.entries(variables)) {
      html = html.replaceAll(`__${key.toUpperCase()}__`, value);
    }

    return html;
  }

  /**
   * Generic email sender.
   */
  private async sendMail(to: string, subject: string, html: string) {
    return this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html,
    });
  }

  /**
   * Verify Email
   */
  async sendVerificationEmail(email: string, firstName: string, token: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

    const html = await this.loadTemplate("verify-email", {
      firstName,
      verificationUrl,
    });

    return this.sendMail(email, "Verify your email", html);
  }

  /**
   * Welcome Email
   */
  async sendWelcomeEmail(email: string, firstName: string) {
    const html = await this.loadTemplate("welcome", {
      firstName,
    });

    return this.sendMail(email, "Welcome to DebSphere Academy", html);
  }

  /**
   * Forgot Password
   */
  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    token: string,
  ) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const html = await this.loadTemplate("forgot-password", {
      firstName,
      resetUrl,
    });

    return this.sendMail(email, "Reset your password", html);
  }
}

export default new EmailService();
