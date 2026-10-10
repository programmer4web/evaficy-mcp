export interface ApiErrorBody {
  success: false;
  error?: string;
  message?: string;
  code?: string;
}

export interface GeneratedTestCase {
  title: string;
  description: string;
  preconditions: string[];
  steps: { stepNumber: number; description: string; expectedResult: string }[];
  testData: { title: string; value: string }[];
  expectedResult: string;
  priority?: string;
  status?: string;
  intelligence?: { selectedType: string; affectedPage?: string; category?: string; version?: string };
}

export interface GenerationResult {
  testCases: GeneratedTestCase[];
}

export interface GenerationJobEvent {
  status: "pending" | "running" | "done" | "failed";
  result: GenerationResult | null;
  error: string | null;
}

export interface UserRef {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface ProjectSummary {
  _id: string;
  name: string;
  description: string;
  owner: string;
  client: string | null;
  memberCount: number;
  scenarioCount: number;
  userRole: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  _id: string;
  user: UserRef;
  role: "PO" | "TL" | "QA" | "Viewer";
  addedAt: string;
  addedBy?: UserRef;
}

export interface ProjectEnvironment {
  _id: string;
  name: string;
  url?: string;
  isDefault: boolean;
}

export interface ProjectDetail {
  _id: string;
  name: string;
  description: string;
  owner: UserRef;
  members: ProjectMember[];
  environments: ProjectEnvironment[];
  client: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  userRole: string;
}

export interface ScenarioSummary {
  _id: string;
  name: string;
  description: string;
  project: string;
  createdBy: UserRef;
  testMetadata: { type: string; affectedPage: string };
  validationStatus: "none" | "pending" | "partial" | "approved" | "rejected";
  validationRequestedBy: string | null;
  validationRequestedAt: string | null;
  lastMaintenanceReviewAt: string | null;
  createdAt: string;
  updatedAt: string;
  testCaseCount: number;
}

export interface ScenarioListResponse {
  success: true;
  scenarios: ScenarioSummary[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface TestCaseStep {
  _id: string;
  stepNumber: number;
  description: string;
  expectedResult: string;
}

export interface TestCaseData {
  _id: string;
  title: string;
  value: string;
}

export interface TestCase {
  _id: string;
  title: string;
  description: string;
  preconditions: string[];
  steps: TestCaseStep[];
  expectedResult: string;
  testData: TestCaseData[];
  validationStatus: "draft" | "pending" | "approved" | "rejected";
  validatedBy: UserRef | null;
  validatedAt: string | null;
  validationNotes: string | null;
}

export interface ScenarioDetail {
  _id: string;
  name: string;
  description: string;
  project: { _id: string; name: string };
  createdBy: UserRef;
  testMetadata: {
    type: string;
    affectedPage: string;
    customFields: { label: string; value: string }[];
  };
  testCases: TestCase[];
  validationStatus: "none" | "pending" | "partial" | "approved" | "rejected";
  validationRequestedBy: UserRef | null;
  validationRequestedAt: string | null;
  lastMaintenanceReviewAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type RunStatus = "draft" | "in_progress" | "completed" | "aborted";

export interface RunSummaryCounts {
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  notRun: number;
  inProgress: number;
  passRate: number;
}

export interface RunListItem {
  _id: string;
  name: string;
  description: string;
  scenario: { _id: string; name: string };
  project: string;
  status: RunStatus;
  createdBy: UserRef;
  environment?: string;
  browser?: string;
  os?: string;
  buildVersion?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  summary: RunSummaryCounts;
  createdAt: string;
  updatedAt: string;
}

export interface RunTestCaseResult {
  _id: string;
  testCase: string;
  testCaseSnapshot: {
    title: string;
    description: string;
    expectedResult: string;
    preconditions: string[];
    steps: { stepNumber: number; action: string; expectedResult: string; data?: string }[];
    testData: { title: string; value: string }[];
    snapshotVersion: string;
  };
  hasDrift: boolean;
  driftDetectedAt: string | null;
  executionStatus: "not_run" | "in_progress" | "passed" | "failed" | "blocked" | "skipped";
  executedBy: UserRef | null;
  executedAt: string | null;
  actualResult?: string;
  stepResults: { stepNumber: number; status: "not_run" | "passed" | "failed"; actualResult?: string; notes?: string }[];
  defectDescription?: string;
  defectSeverity?: "critical" | "major" | "minor" | "trivial";
  defectPriority?: "critical" | "high" | "medium" | "low";
  blockReason?: string;
  skipReason?: string;
  evidenceLinks: { label?: string; url: string; type: "screenshot" | "video" | "log" | "other"; addedAt: string; addedBy: UserRef }[];
  comments: { user: UserRef; text: string; createdAt: string }[];
}

export interface RunDetail extends Omit<RunListItem, "summary"> {
  testCases: RunTestCaseResult[];
  summary: RunSummaryCounts;
}

export interface RunReport {
  run: {
    name: string;
    status: RunStatus;
    environment?: string;
    browser?: string;
    os?: string;
    createdBy: UserRef;
    actualStartDate?: string;
    actualEndDate?: string;
  };
  summary: RunSummaryCounts;
  failedTests: {
    title: string;
    executionStatus: string;
    defectDescription?: string;
    defectSeverity?: string;
    executedBy: UserRef | null;
    evidenceLinks: RunTestCaseResult["evidenceLinks"];
  }[];
  blockedTests: { title: string; blockReason?: string }[];
  timeline: { testCaseTitle: string; executionStatus: string; executedBy: UserRef | null; executedAt: string }[];
}
