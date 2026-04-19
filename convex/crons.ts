import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "delete expired uploadthing recordings",
  { hours: 12 },
  internal.recordingCleanupActions.deleteExpiredRecordings,
  { batchSize: 25 }
);

export default crons;
