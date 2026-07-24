import { Queue } from "bullmq";
import { connection } from "./bull.js";

export const emailQueue = new Queue("emails", {
  connection,
});
