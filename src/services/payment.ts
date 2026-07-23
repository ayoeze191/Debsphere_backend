import { Prisma } from "../prisma/client.js";
import axios from "axios";
import emailservice from "./emailservice.js";
class PaymentService {
  static async handleWebhook(event: any) {
    if (event.event !== "charge.success") {
      return;
    }
    const eventId = event.id;
    const exists = await Prisma.webhookEvent.findUnique({
      where: {
        eventId,
      },
    });

    if (exists) {
      return;
    }
    const reference = event.data.reference;

    // The transaction only creates rows — it also hands back whatever the
    // email needs afterward, and whether we should actually send it (guards
    // against Paystack redelivering the same webhook and double-emailing).
    const result = await Prisma.$transaction(async (tx) => {
      await tx.webhookEvent.create({
        data: {
          eventId,
          eventType: event.event,
          payload: event,
        },
      });

      const payment = await tx.payment.findUnique({
        where: {
          reference,
        },
        include: {
          user: true,
          course: {
            include: {
              category: true,
              sections: {
                include: {
                  lessons: true,
                },
              },
            },
          },
        },
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      if (payment.status === "SUCCESS") {
        // Already processed by an earlier delivery of this same webhook —
        // don't re-enroll, and signal the caller not to re-send the email.
        return { shouldSendEmail: false };
      }

      await tx.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: "SUCCESS",
        },
      });

      const alreadyEnrolled = await tx.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: payment.userId,
            courseId: payment.courseId,
          },
        },
      });

      if (!alreadyEnrolled) {
        const firstLessonId = payment.course.sections.flatMap((section) =>
          section.lessons.map((lesson) => lesson.id),
        )[0];

        await tx.enrollment.create({
          data: {
            userId: payment.userId,
            courseId: payment.courseId,
            ...(firstLessonId ? { lastLessonId: firstLessonId } : {}),
          },
        });
      }

      const lessonCount = payment.course.sections.reduce(
        (total, section) => total + section.lessons.length,
        0,
      );

      return {
        shouldSendEmail: true,
        emailData: {
          email: payment.email,
          firstName: payment.fullName,
          course: {
            title: payment.course.title,
            slug: payment.course.slug,
            category: payment.course.category?.name ?? null,
            thumbnail: payment.course.thumbnail,
            lessonCount,
          },
          payment: {
            amount: Number(payment.amount),
            reference,
            paidAt: new Date(),
          },
        },
      };
    });

    if (result.shouldSendEmail) {
      try {
        await emailservice.PaymentReceivedEmail(
          result!.emailData!.email,
          result!.emailData!.course,
          result!.emailData!.firstName,
          result!.emailData!.payment,
        );
      } catch (err) {
        // The payment/enrollment already succeeded and is committed — a
        // failed email shouldn't fail the webhook or trigger a Paystack
        // retry that would re-process an already-completed payment.
        console.error(
          `Failed to send payment receipt email for ${reference}:`,
          err,
        );
      }
    }
  }

  //   Initialize Payments
  static async initializePayment(
    userId: string,
    slug: string,
    fullName: string,
    email: string,
    phoneNumber: string,
  ) {
    const course = await Prisma.course.findUnique({
      where: {
        slug,
      },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    const enrolled = await Prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: course.id,
        },
      },
    });
    if (enrolled) {
      throw new Error("Already enrolled");
    }

    const user = await Prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    console.log(user, "why not found");
    if (!user) {
      throw new Error("User not found");
    }

    const reference = crypto.randomUUID();

    await Prisma.payment.create({
      data: {
        reference,
        amount: course.price,
        status: "PENDING",
        userId,
        courseId: course.id,
        fullName: fullName,
        email: email,
        phoneNumber: phoneNumber,
      },
    });

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: Number(course.price) * 100,
        reference,
        metadata: {
          userId,
          courseId: course.id,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return {
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code,
      reference,
    };
  }
  static async verifyPayment(reference: string) {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  }
}

export default PaymentService;
