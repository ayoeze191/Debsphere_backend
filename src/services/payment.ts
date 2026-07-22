import { Prisma } from "../prisma/client.js";
import axios from "axios";
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
    await Prisma.$transaction(async (tx) => {
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
          course: {
            include: {
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
        return;
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
            // Courses without lessons can still be purchased; progress starts
            // with a null lastLessonId until content is added.
            ...(firstLessonId ? { lastLessonId: firstLessonId } : {}),
          },
        });
      }
    });
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
