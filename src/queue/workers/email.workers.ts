import { Worker } from "bullmq";
import { connection } from "../bull.js";
import emailService from "../../services/emailservice.js";

export const worker = new Worker(
  "emails",
  async (job) => {
    switch (job.name) {
      case "send-verification-email":
        await emailService.sendVerificationEmail(
          job.data.email,
          job.data.firstName,
          job.data.token,
        );
        break;
      case "send-payment-received":
        console.log(job.data);
        await emailService.PaymentReceivedEmail(
          job.data.email,
          job.data.course,
          job.data.firstName,
          job.data.payment,
        );
    }
  },
  {
    connection,
  },
);

worker.on("ready", () => {
  console.log("✅ Worker connected to Redis");
});

worker.on("completed", (job) => {
  console.log(`✅ ${job.name} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ ${job?.name} failed`, err);
});
