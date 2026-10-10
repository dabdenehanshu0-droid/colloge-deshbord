export type Role = "STUDENT" | "TEACHER" | "ADMIN";

export interface User {
  id: number;
  name: string;
  role: Role;
  student_id?: number;
  teacher_id?: number;
  section_id?: number;
  email: string;
  avatar?: string;
  department?: string;
}

export type OutcomeKind = "OUTCOME" | "PREREQUISITE";

export interface Outcome {
  id: number;
  code: string; // "LO1", "LO2", "LO3", "LO4", "P1", "P2"
  statement: string;
  kind: OutcomeKind;
  prerequisite_ids: number[];
}

export type BlockType =
  | "TITLE"
  | "OBJECTIVES"
  | "EXPLANATION"
  | "KEY_CONCEPTS"
  | "EXAMPLE"
  | "MISCONCEPTION"
  | "QUICK_CHECK"
  | "SOURCE";

export interface Block {
  id: number;
  seq: number;
  type: BlockType;
  title?: string;
  content: {
    text?: string;
    items?: string[];
    question?: string;
    answer?: string;
    subtext?: string;
    code?: string;
  };
  outcome_ids: number[];
  origin: "AI" | "EDITED";
  source_id?: number;
}

export type LessonStatus = "DRAFT" | "REVIEWED" | "APPROVED" | "PUBLISHED";

export interface Source {
  id: number;
  title: string;
  citation: string;
  approved: boolean;
  topic_id?: number;
}

export interface Lesson {
  id: number;
  topic_id: number;
  title: string;
  status: LessonStatus;
  generation_mode: "LIVE" | "FALLBACK";
  blocks: Block[];
  source: Source | null;
  unedited_ai_pct: number;
  approved_at?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  id: number;
  label: string; // "A", "B", "C", "D"
  text: string;
  is_correct?: boolean; // Only available to teacher/backend
  misconception?: {
    tag: string;
    label: string;
  } | null;
}

export interface StudentQuestion {
  id: number;
  seq: number;
  stem: string;
  learning_outcome_id: number;
  options: {
    id: number;
    label: string;
    text: string;
  }[];
}

export interface TeacherQuestion extends StudentQuestion {
  purpose: "POLL" | "EXIT_QUIZ";
  options: QuestionOption[];
  explanation: string;
}

export type MasteryStatus = "STRONG" | "DEVELOPING" | "WEAK";

export interface MasteryItem {
  outcome: Outcome;
  percent: number; // 0-100
  estimate: number; // 0.0 - 1.0
  status: MasteryStatus;
  evidence_count: number;
  prior_note: string;
  provenance: "LIVE" | "SEEDED" | "MIXED";
}

export interface SessionParticipant {
  id: number;
  name: string;
  joined_at: string;
  quiz_submitted: boolean;
}

export interface SessionState {
  id: number;
  status: "LIVE" | "ENDED";
  version: number;
  lesson: {
    id: number;
    title: string;
    slides: Block[];
  };
  section_id: number;
  current_slide_index: number;
  current_outcome_id: number | null;
  quiz: {
    status: "NOT_STARTED" | "OPEN" | "CLOSED";
    submitted_count: number;
    total_participants: number;
  };
  active_poll: {
    id: number;
    status: "OPEN" | "CLOSED";
    question: StudentQuestion;
    counts?: Record<number, number>; // optionId -> count
  } | null;
  active_prompt: {
    id: number;
    text: string;
  } | null;
  participants_count: number;
  join_url: string;
  participants?: SessionParticipant[];
}

export interface QuizSubmissionItem {
  question_id: number;
  option_id: number;
  duration_ms?: number;
}

export interface QuizResultItem {
  question_id: number;
  learning_outcome_id: number;
  selected_option_id: number;
  correct_option_id: number;
  is_correct: boolean;
  explanation: string;
  misconception?: {
    tag: string;
    label: string;
  };
}

export interface LearningGap {
  outcome_id: number;
  code: string;
  percent: number;
  status: MasteryStatus;
  misconception?: {
    tag: string;
    label: string;
    description: string;
  };
}

export interface QuizResult {
  duplicate: boolean;
  context: "EXIT_QUIZ" | "PRACTICE";
  score: {
    correct: number;
    total: number;
  };
  items: QuizResultItem[];
  mastery_before?: MasteryItem[];
  mastery: MasteryItem[];
  gaps: LearningGap[];
  provenance: "LIVE";
  submitted_at: string;
  scripted?: boolean;
}

export interface ReteachSegment {
  title: string;
  duration_min: number;
  outline: {
    minute_range: string;
    activity: string;
  }[];
  worked_example: {
    setup: string;
    steps: string[];
    takeaway: string;
  };
  check_items: {
    stem: string;
    options: string[];
    answer: string;
  }[];
  generation_mode: "LIVE" | "FALLBACK";
}

export interface RecommendationStep {
  kind: "RECAP" | "PRACTICE" | "TUTOR";
  label: string;
  detail?: string;
}

export interface Recommendation {
  id: number;
  type: "RETEACH" | "PRACTICE_ASSIGNED" | "ACADEMIC";
  outcome?: Outcome;
  title: string;
  what_happened?: string;
  why_seen?: string;
  why?: string;
  suggested_action?: string;
  suggested_approach?: string;
  facts?: string[];
  steps?: RecommendationStep[];
  recap_status?: "COMPLETED" | "PENDING";
  recap_text?: string;
  mastery_percent?: number;
  status?: "ACTIVE" | "COMPLETED";
  segment?: ReteachSegment;
  actions?: string[];
}

export interface EvidenceEvent {
  occurred_at: string;
  source_type: "EXIT_QUIZ" | "LIVE_POLL" | "PRACTICE";
  question_stem: string;
  selected: string;
  correct: string;
  is_correct: boolean;
  weight: number;
  misconception?: string;
  outcome_id: number;
}

export interface SkillItem {
  name: string;
  level: "NEEDS_PRACTICE" | "DEVELOPING" | "STRONG" | "RECOMMENDED_NEXT";
  source: "DERIVED" | "SEEDED";
}

export interface SkillPassportData {
  profile: string;
  skills: SkillItem[];
  evidence: {
    label: string;
    detail: string;
  }[];
  career_direction: string;
  recommended_next_skill: string;
  provenance: "MIXED";
}

export interface ClassInsightOutcome {
  outcome_id: number;
  code: string;
  statement: string;
  class_mastery_percent: number;
  status: MasteryStatus;
  warning: boolean;
  distribution: {
    strong: number;
    developing: number;
    weak: number;
  };
  weak_count: number;
  weak_share_pct: number;
  top_misconception: {
    tag: string;
    label: string;
    count: number;
  } | null;
}

export interface ClassInsightsData {
  section: {
    id: number;
    name: string;
    enrolled_count: number;
  };
  respondents: number;
  live_participants: number;
  outcomes: ClassInsightOutcome[];
  support_summary: {
    outcome_id: number;
    code: string;
    students_needing_support: number;
    text: string;
  };
  provenance: "MIXED";
  seeded_note: string;
}

export interface AdminOverviewData {
  total_students: number;
  active_courses: number;
  outcomes_tracked: number;
  weak_outcomes: number;
  sections: number;
  provenance: "MIXED";
  seeded_note: string;
}

export interface AdminGapData {
  outcome: {
    code: string;
    statement: string;
    course: string;
  };
  recurring: boolean;
  sections: {
    name: string;
    weak_share_pct: number;
    respondents: number;
  }[];
  combined_weak_share_pct: number;
  total_respondents: number;
  prerequisites: {
    code: string;
    name: string;
    developing_or_better_pct: number;
  }[];
  why_this_matters: string;
  suggested_actions: string[];
  provenance: "MIXED";
}

export interface AdminAnalyticsData {
  mastery_by_outcome: {
    code: string;
    combined_mean_pct: number;
  }[];
  section_comparison: {
    section: string;
    outcome_code: string;
    weak_share_pct: number;
  }[];
  weak_distribution: {
    outcome_code: string;
    strong: number;
    developing: number;
    weak: number;
  }[];
  prerequisites: {
    code: string;
    name: string;
    mastery_pct: number;
  }[];
}

export interface GovernancePolicy {
  ai_mode: string;
  sources: string;
  data: string;
  model: string;
  model_name: string;
  usage_policy: string[];
  approved_sources: Source[];
}

export interface AiInteractionLog {
  id: number;
  timestamp: string;
  user: string;
  role: Role;
  function: string;
  model: string;
  status: "OK" | "FALLBACK" | "ERROR";
  prompt_summary?: string;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  role: Role;
  action: string;
  entity: string;
}

export interface DemoStep {
  n: number;
  key: string;
  label: string;
  done: boolean;
  detail: string;
  actionLink: string;
}

export interface DemoState {
  steps: DemoStep[];
  current_step: number;
  loop: {
    teach: boolean;
    learn: boolean;
    assess: boolean;
    understand: boolean;
    personalize: boolean;
    support_teacher: boolean;
    inform_university: boolean;
    improve: boolean;
  };
}

export interface SystemConfig {
  thresholds: {
    strong: number;
    developing: number;
  };
  status_labels: {
    student: Record<MasteryStatus, string>;
    staff: Record<MasteryStatus, string>;
  };
  demo: {
    allow_audience_join: boolean;
    ai_mode: "LIVE" | "FALLBACK_ONLY";
  };
  university: string;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  programme: string;
  semester: string;
  sections: {
    id: number;
    name: string;
    enrolled_count: number;
  }[];
  topic_count: number;
}

export interface Topic {
  id: number;
  title: string;
  course_id: number;
  seq: number;
  outcomes: Outcome[];
  prerequisites: Outcome[];
}
