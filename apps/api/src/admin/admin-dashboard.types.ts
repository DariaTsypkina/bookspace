export interface AdminDashboardSummary {
  /** Count of MatchQueue rows still awaiting resolution (status OPEN). */
  matchQueueOpen: number;
  /** Count of ContextReading auto-published within the recent window. */
  recentContext: number;
  /** Best-effort sum of failed BullMQ jobs across reachable queues. */
  failedJobs: number;
  /** Window (in days) used for the recentContext counter. */
  recentContextDays: number;
}
