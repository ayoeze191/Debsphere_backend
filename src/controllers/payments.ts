import type { Request, Response } from "express";
import PaymentService from "./../services/payment.js";
import { Prisma } from "../prisma/client.js";
import { emailQueue } from "../queue/email.queue.js";

import { success } from "zod";
type Params = {
  reference: string;
};
class PaymentController {
  static async paystackWebhook(req: Request, res: Response) {
    try {
      await PaymentService.handleWebhook(req.body);

      return res.sendStatus(200);
    } catch (error) {
      console.error(error);

      return res.sendStatus(500);
    }
  }
  static async initialize(req: Request, res: Response) {
    const userId = req!.auth!.userId;
    const { slug, email, phoneNumber, fullName } = req.body;

    try {
      const response = await PaymentService.initializePayment(
        userId,
        slug,
        fullName,
        email,
        phoneNumber,
      );
      return res.status(200).json(response);
    } catch (err) {
      return res.status(404).json({ message: "error", error: err });
    }
  }
  static async getStatus(req: Request<Params>, res: Response) {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        message: "Missing reference",
      });
    }

    const payment = await Prisma.payment.findUnique({
      where: {
        reference,
      },
      include: {
        course: true,
      },
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      status: payment.status,
      success: true,
      amount: payment.amount,
      course: {
        id: payment.course.id,
        slug: payment.course.slug,
        title: payment.course.title,
      },
    });
  }

  static async verifyPayment(req: Request, res: Response) {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({
        message: "Missing reference",
      });
    }

    try {
      const payment = await Prisma.payment.findUnique({
        where: { reference },
        include: { course: true },
      });

      if (!payment) {
        return res
          .status(404)
          .json({ success: false, message: "Payment not found" });
      }

      // Webhook already confirmed it — nothing to do.
      if (payment.status === "SUCCESS") {
        return res.status(200).json({
          success: true,
          status: "SUCCESS",
          course: { slug: payment.course.slug, title: payment.course.title },
          amount: payment.amount,
        });
      }

      const paystackdata = await PaymentService.verifyPayment(reference);
      if (paystackdata.data.status !== "success") {
        return res.status(400).json({
          message: "Payment was not successful",
        });
      }

      const expectedKobo = payment.amount.toNumber() * 100;
      if (paystackdata.data.amount !== expectedKobo) {
        return res
          .status(409)
          .json({ message: "Amount mismatch — flagged for review" });
      }

      await Prisma.$transaction(async (tx) => {
        const fresh = await tx.payment.findUnique({ where: { reference } });
        if (fresh?.status === "SUCCESS") return;

        await tx.payment.update({
          where: { reference },
          data: { status: "SUCCESS" },
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
          await tx.enrollment.create({
            data: { userId: payment.userId, courseId: payment.courseId },
          });
          const course = await Prisma.course.findUnique({
            where: {
              id: payment.courseId,
            },
            include: {
              sections: {
                select: {
                  _count: {
                    select: {
                      lessons: true,
                    },
                  },
                },
              },
            },
          });

          const lessonCount =
            course?.sections.reduce(
              (total, section) => total + section._count.lessons,
              0,
            ) ?? 0;
          emailQueue.add("send-payment-received", {
            email: req.auth?.email,
            course: { ...payment.course, lessoncount: lessonCount },
            firstName: payment.fullName,
            payment: payment,
          });
        }
      });

      return res.status(200).json({
        success: true,
        status: "SUCCESS",
        course: { slug: payment.course.slug, title: payment.course.title },
        amount: payment.amount,
      });
    } catch (err) {
      return res.status(500).json({ message: "Unable to verify payment" });
    }
  }
}

export default PaymentController;
