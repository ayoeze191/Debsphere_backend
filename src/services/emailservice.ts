import fs from "fs/promises";
import path from "path";
import { Resend } from "resend";
import type { CreateEmailOptions } from "resend";

const EMAIL_TEMPLATE_PATH = path.resolve(process.cwd(), "emails", "dist");

class EmailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

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
    const payload: CreateEmailOptions = {
      from: process.env.MAIL_FROM!,
      to,
      subject,
      html,
    };
    const response = await this.resend.emails.send(payload);
    return;
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

  // payment Received email
  async PaymentReceivedEmail(
    email: string,
    course: {
      title: string;
      slug: string;
      category?: string | null;
      thumbnail?: string | null;
      lessonCount: number;
    },
    firstName: string,
    payment: {
      amount: number;
      reference: string;
      paidAt: Date;
    },
  ) {
    const courseUrl = `${process.env.FRONTEND_URL}/courses/${course.slug}`;
    const myLearningUrl = `${process.env.FRONTEND_URL}/dashboard/learn`;

    const html = await this.loadTemplate("payment-received", {
      firstname: firstName,
      coursetitle: course.title,
      coursecategory: course.category ?? "Course",
      coursethumbnail: course.thumbnail ?? "",
      lessoncount: String(course.lessonCount),
      amount: payment.amount.toLocaleString("en-NG"),
      reference: payment.reference,
      paymentdate: payment.paidAt.toLocaleDateString("en-NG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      courseurl: courseUrl,
      mylearningurl: myLearningUrl,
    });

    return this.sendMail(email, "Payment Received", html);
  }
}

export default new EmailService();
