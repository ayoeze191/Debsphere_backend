import PaymentService from "./../services/payment.js";
import { Prisma } from "../prisma/client.js";
import { success } from "zod";
class PaymentController {
    static async paystackWebhook(req, res) {
        try {
            await PaymentService.handleWebhook(req.body);
            return res.sendStatus(200);
        }
        catch (error) {
            console.error(error);
            return res.sendStatus(500);
        }
    }
    static async initialize(req, res) {
        const userId = req.auth.userId;
        const { slug, email, phoneNumber, fullName } = req.body;
        try {
            const response = await PaymentService.initializePayment(userId, slug, fullName, email, phoneNumber);
            return res.status(200).json(response);
        }
        catch (err) {
            return res.status(404).json({ message: "error", error: err });
        }
    }
    static async getStatus(req, res) {
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
    static async verifyPayment(req, res) {
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
                if (fresh?.status === "SUCCESS")
                    return;
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
                }
            });
            return res.status(200).json({
                success: true,
                status: "SUCCESS",
                course: { slug: payment.course.slug, title: payment.course.title },
                amount: payment.amount,
            });
        }
        catch (err) {
            return res.status(500).json({ message: "Unable to verify payment" });
        }
    }
}
export default PaymentController;
//# sourceMappingURL=payments.js.map