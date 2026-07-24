import "dotenv/config";

import { worker } from "./queue/workers/email.workers.js";

console.log("Email worker started...");

console.log("🚀 Email worker started");

const shutdown = async () => {
  console.log("🛑 Shutting down worker...");

  await worker.close();

  console.log("✅ Worker stopped");
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
