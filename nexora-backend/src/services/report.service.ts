import prisma from "../config/prisma";

export type ReportReason =
  | "fake"
  | "harassment"
  | "inappropriate"
  | "scam"
  | "other";

export type ReportStatus =
  | "pending"
  | "resolved"
  | "dismissed";

const VALID_REASONS: ReportReason[] = [
  "fake",
  "harassment",
  "inappropriate",
  "scam",
  "other",
];

const parsePositiveId = (value: unknown): number => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid user ID");
  }

  return id;
};

const normalizeReason = (
  value: unknown
): ReportReason => {
  if (
    typeof value !== "string" ||
    !VALID_REASONS.includes(value as ReportReason)
  ) {
    throw new Error(
      "Invalid report reason. Allowed values: fake, harassment, inappropriate, scam, other"
    );
  }

  return value as ReportReason;
};

const normalizeDetails = (
  value: unknown
): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error("Report details must be text");
  }

  const details = value.trim();

  if (details.length > 2000) {
    throw new Error(
      "Report details cannot exceed 2000 characters"
    );
  }

  return details || null;
};

const formatReport = (report: {
  id: bigint | number;
  reporter_id: bigint | number;
  reported_id: bigint | number;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  created_at: Date;
}) => ({
  id: String(report.id),
  reporterId: String(report.reporter_id),
  reportedId: String(report.reported_id),
  reason: report.reason,
  details: report.details,
  status: report.status,
  createdAt: report.created_at,
});

export const createReport = async (
  reporterIdInput: string,
  reportedIdInput: string,
  input: {
    reason?: unknown;
    details?: unknown;
  }
) => {
  const reporterId = parsePositiveId(reporterIdInput);
  const reportedId = parsePositiveId(reportedIdInput);

  if (reporterId === reportedId) {
    throw new Error("You cannot report yourself");
  }

  const reason = normalizeReason(input.reason);
  const details = normalizeDetails(input.details);

  const users = await prisma.$queryRaw<
    Array<{ id: bigint }>
  >`
    SELECT id
    FROM users
    WHERE id IN (${reporterId}, ${reportedId})
  `;

  if (users.length !== 2) {
    throw new Error("User not found");
  }

  const existingPendingReport = await prisma.$queryRaw<
    Array<{
      id: bigint;
      reporter_id: bigint;
      reported_id: bigint;
      reason: ReportReason;
      details: string | null;
      status: ReportStatus;
      created_at: Date;
    }>
  >`
    SELECT
      id,
      reporter_id,
      reported_id,
      reason,
      details,
      status,
      created_at
    FROM reports
    WHERE reporter_id = ${reporterId}
      AND reported_id = ${reportedId}
      AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (existingPendingReport.length > 0) {
    throw new Error(
      "You already have a pending report for this user"
    );
  }

  await prisma.$executeRaw`
    INSERT INTO reports (
      reporter_id,
      reported_id,
      reason,
      details,
      status
    )
    VALUES (
      ${reporterId},
      ${reportedId},
      ${reason},
      ${details},
      'pending'
    )
  `;

  const report = await prisma.$queryRaw<
    Array<{
      id: bigint;
      reporter_id: bigint;
      reported_id: bigint;
      reason: ReportReason;
      details: string | null;
      status: ReportStatus;
      created_at: Date;
    }>
  >`
    SELECT
      id,
      reporter_id,
      reported_id,
      reason,
      details,
      status,
      created_at
    FROM reports
    WHERE reporter_id = ${reporterId}
      AND reported_id = ${reportedId}
      AND status = 'pending'
    ORDER BY id DESC
    LIMIT 1
  `;

  if (report.length === 0) {
    throw new Error("Failed to create report");
  }

  return formatReport(report[0]);
};

export const getMyReports = async (
  reporterIdInput: string
) => {
  const reporterId = parsePositiveId(reporterIdInput);

  const reports = await prisma.$queryRaw<
    Array<{
      id: bigint;
      reporter_id: bigint;
      reported_id: bigint;
      reason: ReportReason;
      details: string | null;
      status: ReportStatus;
      created_at: Date;
    }>
  >`
    SELECT
      id,
      reporter_id,
      reported_id,
      reason,
      details,
      status,
      created_at
    FROM reports
    WHERE reporter_id = ${reporterId}
    ORDER BY created_at DESC
  `;

  return reports.map(formatReport);
};