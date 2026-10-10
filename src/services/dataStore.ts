import {
  User,
  Outcome,
  Course,
  Topic,
  Source,
  Lesson,
  Block,
  TeacherQuestion,
  MasteryItem,
  SessionState,
  QuizResult,
  QuizSubmissionItem,
  Recommendation,
  EvidenceEvent,
  SkillPassportData,
  ClassInsightsData,
  AdminOverviewData,
  AdminGapData,
  AdminAnalyticsData,
  GovernancePolicy,
  AiInteractionLog,
  AuditLog,
  DemoState,
  SystemConfig,
  ReteachSegment
} from '../types';

// Storage key to persist across refreshes
const STORAGE_KEY = 'sgsu_platform_core_db_v2';
const EVENT_BUS_KEY = 'sgsu_platform_event_bus';

export interface PlatformDbState {
  version: number;
  config: SystemConfig;
  users: User[];
  currentUserId: number;
  courses: Course[];
  topics: Topic[];
  sources: Source[];
  questions: TeacherQuestion[];
  lessons: Lesson[];
  activeSession: SessionState | null;
  studentMastery: Record<number, MasteryItem[]>; // studentId -> items
  studentRecommendations: Record<number, Recommendation[]>;
  evidenceEvents: EvidenceEvent[];
  classRecommendations: Recommendation[];
  assignedPracticeSets: Record<number, any[]>; // studentId -> practice sets
  tutorMessages: { id: number; studentId: number; text: string; sender: 'student' | 'tutor'; timestamp: string; mode: 'LIVE' | 'FALLBACK' }[];
  aiLogs: AiInteractionLog[];
  auditLogs: AuditLog[];
  pollResponses: Record<number, Record<number, number>>; // pollId -> { studentId: optionId }
  adminRecommendations: { id: number; text: string; mode: 'LIVE' | 'FALLBACK'; facts: string[]; createdAt: string }[];
}

export const SEEDED_OUTCOMES: Outcome[] = [
  {
    id: 1,
    code: 'LO1',
    statement: 'Understand Perceptron and Feedforward Neural Network architectures',
    kind: 'OUTCOME',
    prerequisite_ids: []
  },
  {
    id: 2,
    code: 'LO2',
    statement: 'Compute activation functions (Sigmoid, ReLU) and derivative gradients',
    kind: 'OUTCOME',
    prerequisite_ids: [5]
  },
  {
    id: 3,
    code: 'LO3',
    statement: 'Formulate Loss Functions and Objective Optimization',
    kind: 'OUTCOME',
    prerequisite_ids: []
  },
  {
    id: 4,
    code: 'LO4',
    statement: 'Apply Backpropagation and Chain Rule for Multi-Layer Weight Updates',
    kind: 'OUTCOME',
    prerequisite_ids: [5, 6]
  },
  {
    id: 5,
    code: 'P1',
    statement: 'Basic Calculus and Function Derivatives',
    kind: 'PREREQUISITE',
    prerequisite_ids: []
  },
  {
    id: 6,
    code: 'P2',
    statement: 'Chain Rule and Partial Derivatives',
    kind: 'PREREQUISITE',
    prerequisite_ids: [5]
  }
];

export const SEEDED_SOURCE: Source = {
  id: 1,
  title: 'Deep Learning Foundations: Architectures, Backpropagation & Gradient Calculus',
  citation: 'Scope Global Skills University Academic Press, AI Curriculum Standard 2026, Ch. 4 pp. 112–148',
  approved: true,
  topic_id: 101
};

export const SEEDED_QUESTIONS: TeacherQuestion[] = [
  {
    id: 1,
    seq: 1,
    stem: 'Which component of an artificial neuron applies the non-linear transformation over the weighted sum of inputs?',
    learning_outcome_id: 1,
    purpose: 'EXIT_QUIZ',
    options: [
      { id: 101, label: 'A', text: 'Weight matrix multiplication', is_correct: false },
      { id: 102, label: 'B', text: 'Activation function (e.g. ReLU, Sigmoid)', is_correct: true },
      { id: 103, label: 'C', text: 'Bias accumulator', is_correct: false },
      { id: 104, label: 'D', text: 'Learning rate scaler', is_correct: false }
    ],
    explanation: 'Activation functions introduce non-linearity into neurons, allowing networks to learn complex manifold representations.'
  },
  {
    id: 2,
    seq: 2,
    stem: 'Why is the mathematical derivative of an activation function critical during gradient computation?',
    learning_outcome_id: 2,
    purpose: 'EXIT_QUIZ',
    options: [
      { id: 201, label: 'A', text: 'It normalizes inputs to zero mean', is_correct: false },
      { id: 202, label: 'B', text: 'It scales how error gradients scale when propagating backward through the non-linearity', is_correct: true },
      { id: 203, label: 'C', text: 'It prevents singular matrix inversion', is_correct: false },
      { id: 204, label: 'D', text: 'It resets dying units back to threshold', is_correct: false }
    ],
    explanation: 'By the chain rule, the gradient flowing back through a neuron must be multiplied by the derivative of its activation evaluated at the forward pre-activation.'
  },
  {
    id: 3,
    seq: 3,
    stem: 'In binary cross-entropy loss, what occurs when the network predicts p ≈ 0 for a ground-truth positive label y = 1?',
    learning_outcome_id: 3,
    purpose: 'EXIT_QUIZ',
    options: [
      { id: 301, label: 'A', text: 'Loss approaches zero', is_correct: false },
      { id: 302, label: 'B', text: 'Loss approaches infinity, penalizing confident incorrect predictions heavily', is_correct: true },
      { id: 303, label: 'C', text: 'Loss converts to mean squared error', is_correct: false },
      { id: 304, label: 'D', text: 'The gradient vector flips to positive identity', is_correct: false }
    ],
    explanation: 'Binary cross-entropy computes -[y*log(p) + (1-y)*log(1-p)]. As p approaches 0 when y=1, -log(p) approaches infinity.'
  },
  {
    id: 4,
    seq: 4,
    stem: 'During backpropagation, how is the weight gradient ∂L/∂w_ij between layer l-1 and layer l mathematically derived?',
    learning_outcome_id: 4,
    purpose: 'EXIT_QUIZ',
    options: [
      { id: 401, label: 'A', text: 'By multiplying the layer l error term δ_j with layer l-1 activation a_i via the chain rule', is_correct: true },
      {
        id: 402,
        label: 'B',
        text: 'By applying output-layer error directly to hidden weights without backwards chain multiplication',
        is_correct: false,
        misconception: {
          tag: 'MISCONCEPTION_OUTPUT_ERROR_DIRECT',
          label: 'Output error applied directly to hidden weights'
        }
      },
      { id: 403, label: 'C', text: 'By adding the learning rate to layer activations', is_correct: false },
      { id: 404, label: 'D', text: 'By calculating forward loss variance across batches', is_correct: false }
    ],
    explanation: 'Backpropagation uses the chain rule: ∂L/∂w_ij = (∂L/∂z_j) * (∂z_j/∂w_ij) = δ_j * a_i. Output error cannot be applied directly without recursive weight matrix transpose scaling.'
  },
  {
    id: 5,
    seq: 5,
    stem: 'If a hidden neuron enters saturation such that its activation derivative σ\'(z) ≈ 0, what happens to gradients for preceding layers?',
    learning_outcome_id: 4,
    purpose: 'EXIT_QUIZ',
    options: [
      { id: 501, label: 'A', text: 'The weight update rate doubles', is_correct: false },
      { id: 502, label: 'B', text: 'The gradient vanishes along that path because multiplicative chain terms drop to zero', is_correct: true },
      {
        id: 503,
        label: 'C',
        text: 'Preceding layers still update at full rate because hidden gradients are independent of activation derivatives',
        is_correct: false,
        misconception: {
          tag: 'MISCONCEPTION_HIDDEN_INDEPENDENCE',
          label: 'Hidden layer updates assumed independent of activation derivatives'
        }
      },
      { id: 504, label: 'D', text: 'The optimizer resets weights to initial uniform bounds', is_correct: false }
    ],
    explanation: 'Because backpropagation relies on the product of derivatives along the chain, any zero factor σ\'(z)=0 collapses the entire backwards gradient for upstream layers (the vanishing gradient problem).'
  }
];

export const INITIAL_CONFIG: SystemConfig = {
  thresholds: {
    strong: 70,
    developing: 50
  },
  status_labels: {
    student: {
      STRONG: 'Strong',
      DEVELOPING: 'Developing',
      WEAK: 'Needs Attention'
    },
    staff: {
      STRONG: 'Strong',
      DEVELOPING: 'Developing',
      WEAK: 'Weak'
    }
  },
  demo: {
    allow_audience_join: false,
    ai_mode: 'LIVE'
  },
  university: 'Scope Global Skills University (SGSU)'
};

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    name: 'Dr. Aarav Mehta',
    role: 'TEACHER',
    teacher_id: 1,
    email: 'aarav.mehta@sgsu.ac.in',
    department: 'Department of AI & Data Science'
  },
  {
    id: 101,
    name: 'Riya Sharma',
    role: 'STUDENT',
    student_id: 101,
    section_id: 1,
    email: 'riya.sharma@sgsu.ac.in',
    department: 'B.Tech CSE (AI & ML)'
  },
  {
    id: 901,
    name: 'Prof. Sunita Rao',
    role: 'ADMIN',
    email: 'dean.academics@sgsu.ac.in',
    department: 'Dean of Academic Governance'
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 1,
    code: 'CS-501',
    name: 'Artificial Intelligence & Neural Architectures',
    programme: 'B.Tech Computer Science & Engineering',
    semester: 'Semester 5',
    sections: [
      { id: 1, name: 'Section 5-A', enrolled_count: 57 },
      { id: 2, name: 'Section 5-B', enrolled_count: 57 }
    ],
    topic_count: 8
  }
];

export const INITIAL_TOPICS: Topic[] = [
  {
    id: 101,
    title: 'Neural Networks & Deep Learning Architectures',
    course_id: 1,
    seq: 4,
    outcomes: SEEDED_OUTCOMES.filter(o => o.kind === 'OUTCOME'),
    prerequisites: SEEDED_OUTCOMES.filter(o => o.kind === 'PREREQUISITE')
  }
];

// Initial pre-class diagnostic mastery items for Riya Sharma
export const INITIAL_STUDENT_MASTERY: MasteryItem[] = [
  {
    outcome: SEEDED_OUTCOMES[0], // LO1
    percent: 88,
    estimate: 0.88,
    status: 'STRONG',
    evidence_count: 2,
    prior_note: 'Pre-class diagnostic (sample)',
    provenance: 'MIXED'
  },
  {
    outcome: SEEDED_OUTCOMES[1], // LO2
    percent: 74,
    estimate: 0.74,
    status: 'STRONG',
    evidence_count: 2,
    prior_note: 'Pre-class diagnostic (sample)',
    provenance: 'MIXED'
  },
  {
    outcome: SEEDED_OUTCOMES[2], // LO3
    percent: 81,
    estimate: 0.81,
    status: 'STRONG',
    evidence_count: 2,
    prior_note: 'Pre-class diagnostic (sample)',
    provenance: 'MIXED'
  },
  {
    outcome: SEEDED_OUTCOMES[3], // LO4
    percent: 41,
    estimate: 0.41,
    status: 'WEAK',
    evidence_count: 2,
    prior_note: 'Pre-class diagnostic (sample)',
    provenance: 'MIXED'
  }
];

export function createInitialLesson(): Lesson {
  const blocks: Block[] = [
    {
      id: 1,
      seq: 1,
      type: 'TITLE',
      title: 'Lecture 14: Neural Networks, Gradient Calculus & Backpropagation',
      content: {
        text: 'Foundations of Multi-Layer Perceptrons and Error Propagation across Deep Architectures.',
        subtext: 'B.Tech CSE Semester 5 · Section 5-A · Scope Global Skills University'
      },
      outcome_ids: [1, 2, 3, 4],
      origin: 'AI'
    },
    {
      id: 2,
      seq: 2,
      type: 'OBJECTIVES',
      title: 'Core Learning Outcomes (LO1–LO4)',
      content: {
        items: [
          'LO1: Master Feedforward Architectures & Deep Perceptron Geometry',
          'LO2: Derive Activation Derivatives & Gradient Flow Dynamics',
          'LO3: Formulate Cross-Entropy Loss & Optimization Landscapes',
          'LO4: Calculate Backpropagation Weight Adjustments via Multivariate Chain Rule'
        ]
      },
      outcome_ids: [1, 2, 3, 4],
      origin: 'AI'
    },
    {
      id: 3,
      seq: 3,
      type: 'EXPLANATION',
      title: 'Feedforward Layer Geometry & Forward Flow (LO1)',
      content: {
        text: 'A feedforward network maps an input vector x ∈ ℝⁿ through affine transformations z^[l] = W^[l]a^[l-1] + b^[l] followed by point-wise non-linear activations a^[l] = σ(z^[l]). Information strictly progresses forward without cyclical recurrence.'
      },
      outcome_ids: [1],
      origin: 'AI'
    },
    {
      id: 4,
      seq: 4,
      type: 'EXPLANATION',
      title: 'Activation Derivatives & Non-Linear Mapping (LO2)',
      content: {
        text: 'Activation functions such as Sigmoid σ(z) = 1/(1+e⁻ᶻ) have analytical derivative σ\'(z) = σ(z)(1 - σ(z)), while ReLU satisfies d/dz max(0,z) = 1 for z > 0. This local derivative acts as a proportional valve for backwards error transmission.'
      },
      outcome_ids: [2],
      origin: 'AI'
    },
    {
      id: 5,
      seq: 5,
      type: 'EXPLANATION',
      title: 'Loss Functions & Optimization Landscapes (LO3)',
      content: {
        text: 'The loss function L(y, ŷ) formalizes the discrepancy between prediction and ground truth. Cross-entropy loss penalizes confident errors exponentially, producing steep error gradients that pull weight parameters toward lower empirical risk.'
      },
      outcome_ids: [3],
      origin: 'AI'
    },
    {
      id: 6,
      seq: 6,
      type: 'EXPLANATION',
      title: 'Multivariate Chain Rule & Backpropagation (LO4)',
      content: {
        text: 'Backpropagation calculates ∂L/∂W^[l] by systematically computing error vectors δ^[l] = (W^[l+1]ᵀ δ^[l+1]) ⊙ σ\'(z^[l]). The weight update is then the outer product ∂L/∂W^[l] = δ^[l] (a^[l-1])ᵀ. Every hidden layer parameter depends directly on the transpose of downstream weight matrices.'
      },
      outcome_ids: [4],
      origin: 'AI'
    },
    {
      id: 7,
      seq: 7,
      type: 'KEY_CONCEPTS',
      title: 'Key Mathematical Invariants',
      content: {
        items: [
          'Upstream Error Vector: δ^[l] captures sensitivity ∂L/∂z^[l]',
          'Transpose Projection: W^[l+1]ᵀ pulls error vectors back across layer boundaries',
          'Derivative Multiplier: Local slope σ\'(z^[l]) modulates gradient volume'
        ]
      },
      outcome_ids: [4],
      origin: 'AI'
    },
    {
      id: 8,
      seq: 8,
      type: 'EXAMPLE',
      title: 'Worked Example: 2-Layer Perceptron Error Flow (LO4)',
      content: {
        text: 'Consider a network with 1 hidden layer: Given output error (ŷ - y), the hidden error δ^[1] equals (w^[2] * (ŷ - y)) * σ\'(z^[1]). Notice that output error is never applied directly to hidden weights without scaling by w^[2] and σ\'(z^[1]).'
      },
      outcome_ids: [4],
      origin: 'AI'
    },
    {
      id: 9,
      seq: 9,
      type: 'MISCONCEPTION',
      title: 'Critical Misconception: Output Error vs Hidden-Layer Update (LO4)',
      content: {
        text: 'Common Student Mistake: Students often believe that hidden layer weights are updated directly from the final output loss (ŷ - y) without recursive matrix multiplication. In reality, hidden weights receive an error signal filtered through all subsequent layer weights and activation derivatives.'
      },
      outcome_ids: [4],
      origin: 'AI'
    },
    {
      id: 10,
      seq: 10,
      type: 'QUICK_CHECK',
      title: 'In-Class Concept Check (LO4)',
      content: {
        question: 'If σ\'(z^[1]) = 0 for a hidden unit, can weights connecting into that unit receive gradient updates from this sample?',
        answer: 'No. Because δ^[1] multiplies by σ\'(z^[1]), the gradient collapses to zero, isolating the upstream weights from that sample update.'
      },
      outcome_ids: [4],
      origin: 'AI'
    },
    {
      id: 11,
      seq: 11,
      type: 'SOURCE',
      title: 'Academic Source Citation',
      content: {
        text: 'Deep Learning Foundations: Architectures, Backpropagation & Gradient Calculus (Scope Global Skills University Academic Press, AI Curriculum Standard 2026, Ch. 4 pp. 112–148)'
      },
      outcome_ids: [1, 2, 3, 4],
      origin: 'AI',
      source_id: 1
    }
  ];

  return {
    id: 1,
    topic_id: 101,
    title: 'Neural Networks & Gradient Calculus: Backpropagation Mechanics',
    status: 'PUBLISHED',
    generation_mode: 'LIVE',
    blocks,
    source: SEEDED_SOURCE,
    unedited_ai_pct: 82,
    approved_at: '2026-10-08T09:30:00Z',
    published_at: '2026-10-08T09:45:00Z',
    created_at: '2026-10-08T09:00:00Z',
    updated_at: '2026-10-08T09:45:00Z'
  };
}

export function createInitialDbState(): PlatformDbState {
  const initialLesson = createInitialLesson();

  const initialSession: SessionState = {
    id: 101,
    status: 'LIVE',
    version: 4,
    lesson: {
      id: initialLesson.id,
      title: initialLesson.title,
      slides: initialLesson.blocks
    },
    section_id: 1,
    current_slide_index: 0,
    current_outcome_id: 1,
    quiz: {
      status: 'NOT_STARTED',
      submitted_count: 0,
      total_participants: 57
    },
    active_poll: null,
    active_prompt: null,
    participants_count: 1,
    join_url: `${window.location.origin}/student/classroom?session=101`,
    participants: [
      {
        id: 101,
        name: 'Riya Sharma',
        joined_at: new Date().toISOString(),
        quiz_submitted: false
      }
    ]
  };

  const initialReteachRec: Recommendation = {
    id: 1,
    type: 'RETEACH',
    outcome: SEEDED_OUTCOMES[3], // LO4
    title: 'Re-teach Backpropagation & Hidden-Layer Chain Rule',
    why: "Low mastery detected from today's exit quiz.",
    suggested_action: '10-minute conceptual recap',
    suggested_approach: 'Use a simple worked example showing how error propagates backward from output to hidden layers.',
    facts: [
      'LO4 Backpropagation mastery is at 41% (Threshold: 50%)',
      '35 students in Section 5-A (61%) failed the chain rule calculation',
      'Dominant misconception: Output error applied directly to hidden layers without derivative weighting'
    ],
    actions: ['GENERATE_SEGMENT', 'VIEW_EVIDENCE', 'ASSIGN_PRACTICE'],
    status: 'ACTIVE'
  };

  const initialStudentRec: Recommendation = {
    id: 101,
    type: 'PRACTICE_ASSIGNED',
    outcome: SEEDED_OUTCOMES[3], // LO4
    title: 'Backpropagation & Hidden Layer Chain Rule Practice',
    what_happened: 'You had difficulty identifying how downstream errors propagate through hidden-layer activation derivatives.',
    why_seen: "Based on your answers in today's exit quiz.",
    suggested_action: 'Complete 3 targeted remedial practice questions on backpropagation.',
    steps: [
      { kind: 'RECAP', label: '2-minute concept recap on weight sensitivity ∂L/∂w_ij' },
      { kind: 'PRACTICE', label: '3 targeted practice questions for LO4' },
      { kind: 'TUTOR', label: 'Ask AI Tutor: "Explain backpropagation simply"' }
    ],
    recap_status: 'COMPLETED',
    recap_text: 'Remember: In backpropagation, ∂L/∂w_ij = δ_j · a_i, where δ_j depends recursively on all downstream weight layers and the local derivative σ\'(z_j). Never apply final error (ŷ - y) directly to hidden layers!',
    mastery_percent: 41,
    status: 'ACTIVE'
  };

  return {
    version: 1,
    config: INITIAL_CONFIG,
    users: INITIAL_USERS,
    currentUserId: 1, // Default teacher
    courses: INITIAL_COURSES,
    topics: INITIAL_TOPICS,
    sources: [SEEDED_SOURCE],
    questions: SEEDED_QUESTIONS,
    lessons: [initialLesson],
    activeSession: initialSession,
    studentMastery: {
      101: [...INITIAL_STUDENT_MASTERY]
    },
    studentRecommendations: {
      101: [initialStudentRec]
    },
    evidenceEvents: [
      {
        occurred_at: '2026-10-08T09:15:00Z',
        source_type: 'EXIT_QUIZ',
        question_stem: 'Which component of an artificial neuron applies the non-linear transformation?',
        selected: 'Activation function (e.g. ReLU, Sigmoid)',
        correct: 'Activation function (e.g. ReLU, Sigmoid)',
        is_correct: true,
        weight: 1.0,
        outcome_id: 1
      },
      {
        occurred_at: '2026-10-08T09:16:00Z',
        source_type: 'EXIT_QUIZ',
        question_stem: 'Why is the mathematical derivative of an activation function critical?',
        selected: 'It scales how error gradients scale when propagating backward',
        correct: 'It scales how error gradients scale when propagating backward',
        is_correct: true,
        weight: 1.0,
        outcome_id: 2
      },
      {
        occurred_at: '2026-10-08T09:17:00Z',
        source_type: 'EXIT_QUIZ',
        question_stem: 'In binary cross-entropy loss, what occurs when predicted p ≈ 0 for y = 1?',
        selected: 'Loss approaches infinity',
        correct: 'Loss approaches infinity',
        is_correct: true,
        weight: 1.0,
        outcome_id: 3
      },
      {
        occurred_at: '2026-10-08T09:18:00Z',
        source_type: 'EXIT_QUIZ',
        question_stem: 'During backpropagation, how is the weight gradient ∂L/∂w_ij mathematically derived?',
        selected: 'By applying output-layer error directly to hidden weights',
        correct: 'By multiplying the layer l error term δ_j with layer l-1 activation a_i',
        is_correct: false,
        weight: 1.0,
        misconception: 'Output error applied directly to hidden weights',
        outcome_id: 4
      },
      {
        occurred_at: '2026-10-08T09:19:00Z',
        source_type: 'EXIT_QUIZ',
        question_stem: 'If a hidden neuron enters saturation σ\'(z) ≈ 0, what happens to gradients?',
        selected: 'Preceding layers still update at full rate',
        correct: 'The gradient vanishes along that path',
        is_correct: false,
        weight: 1.0,
        misconception: 'Hidden layer updates assumed independent of activation derivatives',
        outcome_id: 4
      }
    ],
    classRecommendations: [initialReteachRec],
    assignedPracticeSets: {},
    tutorMessages: [
      {
        id: 1,
        studentId: 101,
        sender: 'tutor',
        text: 'Hello Riya! I am your AI Academic Tutor for CS-501 Neural Networks, grounded strictly in Scope Global Skills University approved course materials. Feel free to ask me to explain backpropagation, gradient calculation, or activation functions.',
        timestamp: '2026-10-08T09:00:00Z',
        mode: 'LIVE'
      }
    ],
    aiLogs: [
      {
        id: 1,
        timestamp: '2026-10-08T09:00:15Z',
        user: 'Dr. Aarav Mehta',
        role: 'TEACHER',
        function: 'generate_lesson',
        model: 'gemini-3.8-flash (Academic Engine)',
        status: 'OK',
        prompt_summary: 'Generate lesson for Topic 101 Neural Networks & Deep Learning Architectures'
      },
      {
        id: 2,
        timestamp: '2026-10-08T09:20:00Z',
        user: 'System Learner Model',
        role: 'STUDENT',
        function: 'generate_explanation',
        model: 'gemini-3.8-flash (Academic Engine)',
        status: 'OK',
        prompt_summary: 'Generate personalized recap for LO4 Backpropagation for Riya Sharma'
      }
    ],
    auditLogs: [
      {
        id: 1,
        timestamp: '2026-10-08T09:30:00Z',
        user: 'Dr. Aarav Mehta',
        role: 'TEACHER',
        action: 'APPROVE_LESSON',
        entity: 'Lesson #1: Neural Networks & Gradient Calculus'
      },
      {
        id: 2,
        timestamp: '2026-10-08T09:45:00Z',
        user: 'Dr. Aarav Mehta',
        role: 'TEACHER',
        action: 'PUBLISH_LESSON',
        entity: 'Lesson #1: Neural Networks & Gradient Calculus'
      },
      {
        id: 3,
        timestamp: '2026-10-08T10:00:00Z',
        user: 'Dr. Aarav Mehta',
        role: 'TEACHER',
        action: 'START_SESSION',
        entity: 'Session #101: Section 5-A'
      }
    ],
    pollResponses: {},
    adminRecommendations: [
      {
        id: 1,
        text: 'The recurring weakness in LO4 (Backpropagation) across both Section 5-A (61% weak) and Section 5-B (54% weak) indicates a systemic prerequisite dependency gap rather than localized teaching variance. We strongly recommend inserting a mandatory 15-minute diagnostic recap on multivariate chain rule calculus (P2) before subsequent lectures.',
        mode: 'LIVE',
        facts: [
          'Combined weak cohort: 58% across 114 students',
          'P2 Chain Rule competency currently at 52%',
          'P1 Basic Calculus competency at 71%'
        ],
        createdAt: '2026-10-08T10:15:00Z'
      }
    ]
  };
}

class PlatformCoreStore {
  private state: PlatformDbState;
  private listeners: Set<() => void> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    this.state = this.loadState();
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(EVENT_BUS_KEY);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'STATE_UPDATED') {
            this.state = this.loadState();
            this.notify();
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported in this environment', e);
      }
    }
  }

  private loadState(): PlatformDbState {
    if (typeof window === 'undefined') return createInitialDbState();
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved platform state', e);
    }
    const fresh = createInitialDbState();
    this.saveState(fresh);
    return fresh;
  }

  private saveState(newState: PlatformDbState) {
    this.state = newState;
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        this.broadcastChannel?.postMessage({ type: 'STATE_UPDATED' });
      } catch (e) {
        console.error('Failed to persist platform state', e);
      }
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public getState(): PlatformDbState {
    return this.state;
  }

  // --- Auth & Session ---
  public setCurrentUser(user: User) {
    const updated = { ...this.state, currentUserId: user.id };
    this.addAuditLog(user.name, user.role, 'LOGIN', `User signed in as ${user.role}`);
    this.saveState(updated);
  }

  public getCurrentUser(): User {
    const found = this.state.users.find((u) => u.id === this.state.currentUserId);
    return found || this.state.users[0];
  }

  // --- Audit & AI Logging ---
  public addAuditLog(user: string, role: User['role'], action: string, entity: string) {
    const newLog: AuditLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user,
      role,
      action,
      entity
    };
    this.state.auditLogs.unshift(newLog);
    if (this.state.auditLogs.length > 100) this.state.auditLogs.pop();
  }

  public addAiLog(user: string, role: User['role'], func: string, model: string, status: 'OK' | 'FALLBACK' | 'ERROR', promptSummary?: string) {
    const newLog: AiInteractionLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user,
      role,
      function: func,
      model,
      status,
      prompt_summary: promptSummary
    };
    this.state.aiLogs.unshift(newLog);
    if (this.state.aiLogs.length > 100) this.state.aiLogs.pop();
    this.saveState({ ...this.state });
  }

  // --- Lesson Lifecycle (SC05) ---
  public generateLesson(topicId: number): Lesson {
    const newLesson: Lesson = {
      id: Date.now(),
      topic_id: topicId,
      title: 'Neural Networks, Gradient Calculus & Backpropagation Mechanics',
      status: 'DRAFT',
      generation_mode: 'LIVE',
      blocks: createInitialLesson().blocks.map(b => ({ ...b, origin: 'AI' })),
      source: SEEDED_SOURCE,
      unedited_ai_pct: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.state.lessons = [newLesson, ...this.state.lessons];
    const user = this.getCurrentUser();
    this.addAiLog(user.name, user.role, 'generate_lesson', 'gemini-3.8-flash (Academic Engine)', 'OK', 'Generated complete multi-block structured lesson for Topic 101');
    this.addAuditLog(user.name, user.role, 'GENERATE_LESSON', `Lesson #${newLesson.id}`);
    this.saveState({ ...this.state });
    return newLesson;
  }

  public updateLessonBlock(lessonId: number, blockId: number, title?: string, content?: any): Block {
    const lesson = this.state.lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');
    const blockIndex = lesson.blocks.findIndex((b) => b.id === blockId);
    if (blockIndex === -1) throw new Error('Block not found');

    const updatedBlock: Block = {
      ...lesson.blocks[blockIndex],
      ...(title !== undefined && { title }),
      content: { ...lesson.blocks[blockIndex].content, ...content },
      origin: 'EDITED'
    };
    lesson.blocks[blockIndex] = updatedBlock;
    // Calculate unedited AI pct
    const aiBlocks = lesson.blocks.filter(b => b.origin === 'AI').length;
    lesson.unedited_ai_pct = Math.round((aiBlocks / lesson.blocks.length) * 100);
    lesson.updated_at = new Date().toISOString();

    const user = this.getCurrentUser();
    this.addAuditLog(user.name, user.role, 'EDIT_LESSON_BLOCK', `Block #${blockId} in Lesson #${lessonId}`);
    this.saveState({ ...this.state });
    return updatedBlock;
  }

  public regenerateLessonBlock(lessonId: number, blockId: number, instruction?: string): Block {
    const lesson = this.state.lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');
    const block = lesson.blocks.find((b) => b.id === blockId);
    if (!block) throw new Error('Block not found');

    // Deterministic re-generation with refined focus
    if (block.type === 'EXPLANATION') {
      block.content.text = `[Refined Explanation] When computing backwards sensitivity, error terms δ^[l] = ∇_z L map direct contributions of weights W^[l+1]ᵀ δ^[l+1] ⊙ σ'(z^[l]). Instruction applied: "${instruction || 'enhance clarity'}".`;
    }
    block.origin = 'AI';
    lesson.updated_at = new Date().toISOString();

    const user = this.getCurrentUser();
    this.addAiLog(user.name, user.role, 'regenerate_lesson_block', 'gemini-3.8-flash', 'OK', `Block #${blockId} refreshed: ${instruction || 'none'}`);
    this.saveState({ ...this.state });
    return block;
  }

  public reviewLesson(lessonId: number): Lesson {
    const lesson = this.state.lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');
    lesson.status = 'REVIEWED';
    lesson.updated_at = new Date().toISOString();
    const user = this.getCurrentUser();
    this.addAuditLog(user.name, user.role, 'REVIEW_LESSON', `Lesson #${lessonId}`);
    this.saveState({ ...this.state });
    return lesson;
  }

  public approveLesson(lessonId: number): Lesson {
    const lesson = this.state.lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');
    lesson.status = 'APPROVED';
    lesson.approved_at = new Date().toISOString();
    lesson.updated_at = new Date().toISOString();
    const user = this.getCurrentUser();
    this.addAuditLog(user.name, user.role, 'APPROVE_LESSON', `Lesson #${lessonId}`);
    this.saveState({ ...this.state });
    return lesson;
  }

  public publishLesson(lessonId: number): Lesson {
    const lesson = this.state.lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');
    lesson.status = 'PUBLISHED';
    lesson.published_at = new Date().toISOString();
    lesson.updated_at = new Date().toISOString();
    const user = this.getCurrentUser();
    this.addAuditLog(user.name, user.role, 'PUBLISH_LESSON', `Lesson #${lessonId}`);
    this.saveState({ ...this.state });
    return lesson;
  }

  // --- Smart Classroom Sessions (SC06, SC11) ---
  public startSession(lessonId: number, sectionId: number): SessionState {
    const lesson = this.state.lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');
    if (lesson.status !== 'PUBLISHED') throw new Error('LESSON_NOT_PUBLISHED');

    const newSession: SessionState = {
      id: Date.now(),
      status: 'LIVE',
      version: 1,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        slides: lesson.blocks
      },
      section_id: sectionId,
      current_slide_index: 0,
      current_outcome_id: lesson.blocks[0]?.outcome_ids[0] || null,
      quiz: {
        status: 'NOT_STARTED',
        submitted_count: 0,
        total_participants: 57
      },
      active_poll: null,
      active_prompt: null,
      participants_count: 1,
      join_url: `${window.location.origin}/student/classroom?session=${Date.now()}`,
      participants: [
        {
          id: 101,
          name: 'Riya Sharma',
          joined_at: new Date().toISOString(),
          quiz_submitted: false
        }
      ]
    };

    this.state.activeSession = newSession;
    const user = this.getCurrentUser();
    this.addAuditLog(user.name, user.role, 'START_SESSION', `Session #${newSession.id} for Lesson #${lessonId}`);
    this.saveState({ ...this.state });
    return newSession;
  }

  public joinSession(sessionId: number, student: User): SessionState {
    if (!this.state.activeSession || this.state.activeSession.status !== 'LIVE') {
      throw new Error('SESSION_NOT_LIVE');
    }
    const session = this.state.activeSession;
    if (!session.participants) session.participants = [];
    const existing = session.participants.find((p) => p.id === student.id);
    if (!existing) {
      session.participants.push({
        id: student.id,
        name: student.name,
        joined_at: new Date().toISOString(),
        quiz_submitted: false
      });
      session.participants_count = session.participants.length;
      session.version += 1;
      this.saveState({ ...this.state });
    }
    return session;
  }

  public changeSlide(action: 'NEXT' | 'PREV' | 'GOTO', index?: number): SessionState {
    if (!this.state.activeSession) throw new Error('No active session');
    const session = this.state.activeSession;
    const total = session.lesson.slides.length;

    if (action === 'NEXT' && session.current_slide_index < total - 1) {
      session.current_slide_index += 1;
    } else if (action === 'PREV' && session.current_slide_index > 0) {
      session.current_slide_index -= 1;
    } else if (action === 'GOTO' && index !== undefined && index >= 0 && index < total) {
      session.current_slide_index = index;
    }
    const currentSlide = session.lesson.slides[session.current_slide_index];
    session.current_outcome_id = currentSlide?.outcome_ids[0] || null;
    session.version += 1;
    this.saveState({ ...this.state });
    return session;
  }

  public postPrompt(text: string): { id: number; text: string } {
    if (!this.state.activeSession) throw new Error('No active session');
    const prompt = { id: Date.now(), text };
    this.state.activeSession.active_prompt = prompt;
    this.state.activeSession.version += 1;
    this.saveState({ ...this.state });
    return prompt;
  }

  public startPoll(questionId: number): any {
    if (!this.state.activeSession) throw new Error('No active session');
    const q = this.state.questions.find((x) => x.id === questionId) || this.state.questions[1];
    const pollId = Date.now();
    this.state.activeSession.active_poll = {
      id: pollId,
      status: 'OPEN',
      question: {
        id: q.id,
        seq: q.seq,
        stem: q.stem,
        learning_outcome_id: q.learning_outcome_id,
        options: q.options.map((o) => ({ id: o.id, label: o.label, text: o.text }))
      },
      counts: {
        [q.options[0].id]: 3,
        [q.options[1].id]: 38,
        [q.options[2].id]: 5,
        [q.options[3].id]: 2
      }
    };
    this.state.pollResponses[pollId] = {};
    this.state.activeSession.version += 1;
    this.saveState({ ...this.state });
    return this.state.activeSession.active_poll;
  }

  public respondPoll(pollId: number, optionId: number, studentId: number) {
    if (!this.state.activeSession || !this.state.activeSession.active_poll) {
      throw new Error('No active poll');
    }
    if (!this.state.pollResponses[pollId]) this.state.pollResponses[pollId] = {};
    this.state.pollResponses[pollId][studentId] = optionId;

    if (this.state.activeSession.active_poll.counts) {
      this.state.activeSession.active_poll.counts[optionId] = (this.state.activeSession.active_poll.counts[optionId] || 0) + 1;
    }
    this.state.activeSession.version += 1;
    this.saveState({ ...this.state });
    return { accepted: true };
  }

  public closePoll(pollId: number) {
    if (!this.state.activeSession || !this.state.activeSession.active_poll) return;
    this.state.activeSession.active_poll.status = 'CLOSED';
    this.state.activeSession.version += 1;
    this.saveState({ ...this.state });
  }

  public startExitQuiz(): SessionState {
    if (!this.state.activeSession) throw new Error('No active session');
    this.state.activeSession.quiz.status = 'OPEN';
    this.state.activeSession.version += 1;
    const user = this.getCurrentUser();
    this.addAuditLog(user.name, user.role, 'START_EXIT_QUIZ', `Session #${this.state.activeSession.id}`);
    this.saveState({ ...this.state });
    return this.state.activeSession;
  }

  public closeExitQuiz(): SessionState {
    if (!this.state.activeSession) throw new Error('No active session');
    this.state.activeSession.quiz.status = 'CLOSED';
    this.state.activeSession.version += 1;
    const user = this.getCurrentUser();
    this.addAuditLog(user.name, user.role, 'CLOSE_EXIT_QUIZ', `Session #${this.state.activeSession.id}`);
    this.saveState({ ...this.state });
    return this.state.activeSession;
  }

  public endSession(): SessionState {
    if (!this.state.activeSession) throw new Error('No active session');
    this.state.activeSession.status = 'ENDED';
    this.state.activeSession.version += 1;
    const user = this.getCurrentUser();
    this.addAuditLog(user.name, user.role, 'END_SESSION', `Session #${this.state.activeSession.id}`);
    this.saveState({ ...this.state });
    return this.state.activeSession;
  }

  // --- Quiz Submission & Mastery Engine (Q02, CR-03, CR-04) ---
  public submitQuiz(
    context: 'EXIT_QUIZ' | 'PRACTICE',
    answers: QuizSubmissionItem[],
    studentId: number,
    scriptedOverride: boolean = false
  ): QuizResult {
    const student = this.state.users.find((u) => u.id === studentId) || this.state.users[1];
    const items = answers.map((ans) => {
      const q = this.state.questions.find((x) => x.id === ans.question_id);
      if (!q) throw new Error(`Question ${ans.question_id} not found`);
      const selectedOpt = q.options.find((o) => o.id === ans.option_id);
      const correctOpt = q.options.find((o) => o.is_correct);
      const isCorrect = Boolean(selectedOpt?.is_correct);

      return {
        question_id: q.id,
        learning_outcome_id: q.learning_outcome_id,
        selected_option_id: ans.option_id,
        correct_option_id: correctOpt?.id || 0,
        is_correct: isCorrect,
        explanation: q.explanation,
        misconception: selectedOpt?.misconception || undefined
      };
    });

    const correctCount = items.filter((i) => i.is_correct).length;

    // Check if this matches scripted path (Q1, Q2, Q3 correct, Q4, Q5 wrong)
    const isScriptedPath =
      scriptedOverride ||
      (items.length >= 5 &&
        items[0].is_correct &&
        items[1].is_correct &&
        items[2].is_correct &&
        !items[3].is_correct &&
        !items[4].is_correct);

    // Compute prior-weighted mastery (CR-03)
    // Headline numbers: LO1 = 88, LO2 = 74, LO3 = 81, LO4 = 41
    const beforeMastery = this.state.studentMastery[studentId]
      ? JSON.parse(JSON.stringify(this.state.studentMastery[studentId]))
      : INITIAL_STUDENT_MASTERY;

    let updatedMastery: MasteryItem[];

    if (context === 'PRACTICE') {
      // In practice mode, each correct answer on LO4 boosts mastery from 41% to 76% (STRONG)
      updatedMastery = beforeMastery.map((item: MasteryItem) => {
        if (item.outcome.code === 'LO4') {
          return {
            ...item,
            percent: 76,
            estimate: 0.76,
            status: 'STRONG' as const,
            evidence_count: item.evidence_count + 3,
            provenance: 'LIVE' as const,
            prior_note: 'Practice completion'
          };
        }
        return item;
      });
    } else if (isScriptedPath) {
      updatedMastery = [
        {
          outcome: SEEDED_OUTCOMES[0],
          percent: 88,
          estimate: 0.88,
          status: 'STRONG',
          evidence_count: 3,
          prior_note: 'Exit Quiz + Diagnostic',
          provenance: 'LIVE'
        },
        {
          outcome: SEEDED_OUTCOMES[1],
          percent: 74,
          estimate: 0.74,
          status: 'STRONG',
          evidence_count: 3,
          prior_note: 'Exit Quiz + Diagnostic',
          provenance: 'LIVE'
        },
        {
          outcome: SEEDED_OUTCOMES[2],
          percent: 81,
          estimate: 0.81,
          status: 'STRONG',
          evidence_count: 3,
          prior_note: 'Exit Quiz + Diagnostic',
          provenance: 'LIVE'
        },
        {
          outcome: SEEDED_OUTCOMES[3],
          percent: 41,
          estimate: 0.41,
          status: 'WEAK',
          evidence_count: 4,
          prior_note: 'Exit Quiz + Diagnostic',
          provenance: 'LIVE'
        }
      ];
    } else {
      // Unscripted dynamic calculation
      updatedMastery = SEEDED_OUTCOMES.filter(o => o.kind === 'OUTCOME').map((outcome) => {
        const loItems = items.filter((i) => i.learning_outcome_id === outcome.id);
        const loCorrect = loItems.filter((i) => i.is_correct).length;
        const livePct = loItems.length > 0 ? (loCorrect / loItems.length) * 100 : 70;
        const prior = beforeMastery.find((b: MasteryItem) => b.outcome.id === outcome.id)?.percent || 70;
        const weightedPct = Math.round(prior * 0.4 + livePct * 0.6);
        const status = weightedPct >= 70 ? 'STRONG' : weightedPct >= 50 ? 'DEVELOPING' : 'WEAK';
        return {
          outcome,
          percent: weightedPct,
          estimate: weightedPct / 100,
          status: status as any,
          evidence_count: loItems.length + 2,
          prior_note: 'Computed from your answers',
          provenance: 'LIVE' as const
        };
      });
    }

    this.state.studentMastery[studentId] = updatedMastery;

    // Identify Learning Gaps
    const gaps = updatedMastery
      .filter((m) => m.status === 'WEAK')
      .map((m) => ({
        outcome_id: m.outcome.id,
        code: m.outcome.code,
        percent: m.percent,
        status: m.status,
        misconception: {
          tag: 'MISCONCEPTION_OUTPUT_ERROR_DIRECT',
          label: 'Output error applied directly to hidden layers',
          description:
            'You selected options applying final error directly to hidden-layer weights, bypassing the chain rule derivative multiplication.'
        }
      }));

    // Register evidence events
    items.forEach((it) => {
      const q = this.state.questions.find((x) => x.id === it.question_id);
      const selOpt = q?.options.find((o) => o.id === it.selected_option_id);
      const corrOpt = q?.options.find((o) => o.id === it.correct_option_id);

      this.state.evidenceEvents.unshift({
        occurred_at: new Date().toISOString(),
        source_type: context,
        question_stem: q?.stem || '',
        selected: selOpt?.text || '',
        correct: corrOpt?.text || '',
        is_correct: it.is_correct,
        weight: context === 'EXIT_QUIZ' ? 1.0 : 0.4,
        misconception: it.misconception?.label,
        outcome_id: it.learning_outcome_id
      });
    });

    // Mark participant submitted in live session
    if (this.state.activeSession) {
      this.state.activeSession.quiz.submitted_count += 1;
      const part = this.state.activeSession.participants?.find((p) => p.id === studentId);
      if (part) part.quiz_submitted = true;
      this.state.activeSession.version += 1;
    }

    // Save and return result
    const result: QuizResult = {
      duplicate: false,
      context,
      score: { correct: correctCount, total: items.length },
      items,
      mastery_before: beforeMastery,
      mastery: updatedMastery,
      gaps,
      provenance: 'LIVE',
      submitted_at: new Date().toISOString(),
      scripted: isScriptedPath
    };

    this.addAuditLog(student.name, student.role, 'SUBMIT_QUIZ', `Context: ${context}, Score: ${correctCount}/${items.length}`);
    this.saveState({ ...this.state });
    return result;
  }

  // --- Tutor & Practice (SC12, SC13) ---
  public askTutor(question: string, studentId: number): { answer: string; topic: string; source: string; label: string; mode: 'LIVE' | 'FALLBACK' } {
    if (this.state.activeSession?.quiz.status === 'OPEN') {
      const error: any = new Error('TUTOR_LOCKED_DURING_QUIZ');
      error.status = 423;
      throw error;
    }

    const answer =
      'In backpropagation, errors propagate strictly in reverse. For any hidden layer l, the sensitivity δ^[l] = (W^[l+1]ᵀ δ^[l+1]) ⊙ σ\'(z^[l]). We then calculate weight updates via ∂L/∂W^[l] = δ^[l] (a^[l-1])ᵀ. Crucially, the output error is never applied directly to hidden layers without multiplying by transpose weights and activation slopes.';

    this.state.tutorMessages.push(
      {
        id: Date.now(),
        studentId,
        text: question,
        sender: 'student',
        timestamp: new Date().toISOString(),
        mode: 'LIVE'
      },
      {
        id: Date.now() + 1,
        studentId,
        text: answer,
        sender: 'tutor',
        timestamp: new Date().toISOString(),
        mode: 'LIVE'
      }
    );

    const student = this.state.users.find((u) => u.id === studentId);
    this.addAiLog(student?.name || 'Riya Sharma', 'STUDENT', 'generate_tutor_response', 'gemini-3.8-flash (Academic Engine)', 'OK', question);
    this.saveState({ ...this.state });

    return {
      answer,
      topic: 'Neural Networks — Backpropagation',
      source: SEEDED_SOURCE.title,
      label: 'Grounded in approved course material',
      mode: 'LIVE'
    };
  }

  public generatePractice(outcomeId: number): any {
    const q1: TeacherQuestion = {
      id: 601,
      seq: 1,
      stem: 'Calculate the weight gradient ∂L/∂w when upstream sensitivity δ = 0.4 and incoming activation a = 0.5:',
      learning_outcome_id: 4,
      purpose: 'POLL',
      options: [
        { id: 6011, label: 'A', text: '0.20 (computed as δ · a)', is_correct: true },
        { id: 6012, label: 'B', text: '0.90 (computed as δ + a)', is_correct: false },
        { id: 6013, label: 'C', text: '0.10', is_correct: false },
        { id: 6014, label: 'D', text: '0.00', is_correct: false }
      ],
      explanation: 'By the chain rule, ∂L/∂w_ij = δ_j · a_i = 0.4 · 0.5 = 0.20.'
    };
    const q2: TeacherQuestion = {
      id: 602,
      seq: 2,
      stem: 'Why does the transpose weight matrix W^[l+1]ᵀ appear in the formula for hidden-layer error δ^[l]?',
      learning_outcome_id: 4,
      purpose: 'POLL',
      options: [
        { id: 6021, label: 'A', text: 'To distribute error backward proportionally to connection strengths', is_correct: true },
        { id: 6022, label: 'B', text: 'To invert numerical precision errors', is_correct: false },
        { id: 6023, label: 'C', text: 'To double learning speed', is_correct: false },
        { id: 6024, label: 'D', text: 'To bypass activation derivatives', is_correct: false }
      ],
      explanation: 'Transpose multiplication projects the downstream error vector backward across the connection weights.'
    };
    const q3: TeacherQuestion = {
      id: 603,
      seq: 3,
      stem: 'If learning rate η = 0.01 and ∂L/∂w = 0.5, what is the weight adjustment Δw?',
      learning_outcome_id: 4,
      purpose: 'POLL',
      options: [
        { id: 6031, label: 'A', text: '-0.005 (gradient descent moves in negative gradient direction)', is_correct: true },
        { id: 6032, label: 'B', text: '+0.005', is_correct: false },
        { id: 6033, label: 'C', text: '-0.50', is_correct: false },
        { id: 6034, label: 'D', text: '+0.50', is_correct: false }
      ],
      explanation: 'Standard gradient descent step is w := w - η (∂L/∂w) = w - 0.01 · 0.5 = w - 0.005.'
    };

    const user = this.getCurrentUser();
    this.addAiLog(user.name, user.role, 'generate_practice_questions', 'gemini-3.8-flash', 'OK', 'Targeted practice set for LO4');

    return {
      set_id: Date.now(),
      outcome: SEEDED_OUTCOMES[3],
      generation_mode: 'LIVE',
      questions: [q1, q2, q3]
    };
  }

  public generateReteachSegment(outcomeId: number): ReteachSegment {
    const segment: ReteachSegment = {
      title: '10-Minute Concept Recap: Backpropagation & Chain Rule Mechanics',
      duration_min: 10,
      outline: [
        { minute_range: '00:00 – 03:00', activity: 'Recap output layer error vector δ^[2] = (ŷ - y) ⊙ σ\'(z^[2])' },
        { minute_range: '03:00 – 07:00', activity: 'Worked step-by-step example projecting error backward using Wᵀ' },
        { minute_range: '07:00 – 10:00', activity: 'Interactive concept check on why output error cannot be applied directly' }
      ],
      worked_example: {
        setup: 'A 2-input, 2-hidden, 1-output unit network with known forward activations.',
        steps: [
          'Step 1: Compute output error scalar e = ŷ - y = 0.8 - 0.0 = 0.8',
          'Step 2: Multiply by output derivative σ\'(z_out) = 0.16 -> δ_out = 0.128',
          'Step 3: Pull back into hidden unit 1: δ_h1 = (w_h1_out * δ_out) * σ\'(z_h1)',
          'Step 4: Update weight w_in_h1 = w_in_h1 - η * (δ_h1 * x_in)'
        ],
        takeaway: 'Notice how every hidden weight update explicitly incorporates the downstream weights and local derivative.'
      },
      check_items: [
        {
          stem: 'Does an upstream weight gradient depend directly on the forward activation of its input unit?',
          options: ['Yes, ∂L/∂w_ij = δ_j · a_i', 'No, only on the bias', 'Only in convolutional nets'],
          answer: 'Yes, ∂L/∂w_ij = δ_j · a_i'
        },
        {
          stem: 'What term ensures hidden layers learn features rather than mirror the output loss directly?',
          options: ['Downstream transpose weights Wᵀ and local derivative σ\'(z)', 'Random dropout', 'Batch normalization'],
          answer: 'Downstream transpose weights Wᵀ and local derivative σ\'(z)'
        }
      ],
      generation_mode: 'LIVE'
    };

    // Store in class recommendation
    const rec = this.state.classRecommendations.find((r) => r.type === 'RETEACH');
    if (rec) {
      rec.segment = segment;
    }

    const user = this.getCurrentUser();
    this.addAiLog(user.name, user.role, 'generate_reteach_segment', 'gemini-3.8-flash (Academic Engine)', 'OK', 'Drafted 10-min remedial segment for LO4');
    this.saveState({ ...this.state });
    return segment;
  }

  // --- Aggregate Views (SC08, SC15, SC16) ---
  public getClassInsights(sectionId: number): ClassInsightsData {
    // 35 students out of 57 need support on LO4 (61%)
    return {
      section: {
        id: sectionId,
        name: sectionId === 1 ? 'Section 5-A' : 'Section 5-B',
        enrolled_count: 57
      },
      respondents: 57,
      live_participants: 1,
      outcomes: [
        {
          outcome_id: 1,
          code: 'LO1',
          statement: SEEDED_OUTCOMES[0].statement,
          class_mastery_percent: 88,
          status: 'STRONG',
          warning: false,
          distribution: { strong: 48, developing: 7, weak: 2 },
          weak_count: 2,
          weak_share_pct: 4,
          top_misconception: null
        },
        {
          outcome_id: 2,
          code: 'LO2',
          statement: SEEDED_OUTCOMES[1].statement,
          class_mastery_percent: 74,
          status: 'STRONG',
          warning: false,
          distribution: { strong: 38, developing: 14, weak: 5 },
          weak_count: 5,
          weak_share_pct: 9,
          top_misconception: null
        },
        {
          outcome_id: 3,
          code: 'LO3',
          statement: SEEDED_OUTCOMES[2].statement,
          class_mastery_percent: 81,
          status: 'STRONG',
          warning: false,
          distribution: { strong: 44, developing: 10, weak: 3 },
          weak_count: 3,
          weak_share_pct: 5,
          top_misconception: null
        },
        {
          outcome_id: 4,
          code: 'LO4',
          statement: SEEDED_OUTCOMES[3].statement,
          class_mastery_percent: 41,
          status: 'WEAK',
          warning: true,
          distribution: { strong: 8, developing: 14, weak: 35 },
          weak_count: 35,
          weak_share_pct: 61,
          top_misconception: {
            tag: 'MISCONCEPTION_OUTPUT_ERROR_DIRECT',
            label: 'Output error applied directly to hidden weights',
            count: 29
          }
        }
      ],
      support_summary: {
        outcome_id: 4,
        code: 'LO4',
        students_needing_support: 35,
        text: '35 students need support on LO4 (61%)'
      },
      provenance: 'MIXED',
      seeded_note: '1 live student + 56 seeded cohort respondents in Section 5-A'
    };
  }

  public getAdminOverview(): AdminOverviewData {
    return {
      total_students: 114,
      active_courses: 1,
      outcomes_tracked: 4,
      weak_outcomes: 1,
      sections: 2,
      provenance: 'MIXED',
      seeded_note: 'Aggregated over Section 5-A (57 students) and Section 5-B (57 students)'
    };
  }

  public getAdminGaps(): AdminGapData[] {
    return [
      {
        outcome: {
          code: 'LO4',
          statement: 'Apply Backpropagation and Chain Rule for Multi-Layer Weight Updates',
          course: 'CS-501 Artificial Intelligence'
        },
        recurring: true,
        sections: [
          { name: 'Section 5-A', weak_share_pct: 61, respondents: 57 },
          { name: 'Section 5-B', weak_share_pct: 54, respondents: 57 }
        ],
        combined_weak_share_pct: 58,
        total_respondents: 114,
        prerequisites: [
          { code: 'P2', name: 'Chain Rule and Partial Derivatives', developing_or_better_pct: 52 },
          { code: 'P1', name: 'Basic Calculus and Function Derivatives', developing_or_better_pct: 71 }
        ],
        why_this_matters: 'The same learning outcome is weak across multiple sections (61% and 54%), demonstrating a structural curriculum gap in Chain Rule prerequisites.',
        suggested_actions: [
          'Review teaching material and add interactive multi-layer chain rule step-by-step visualizer',
          'Review prerequisite coverage in Semester 3 Applied Mathematics (P2 Chain Rule)',
          'Consider additional remedial content in university learning portal'
        ],
        provenance: 'MIXED'
      }
    ];
  }

  public getAdminAnalytics(): AdminAnalyticsData {
    return {
      mastery_by_outcome: [
        { code: 'LO1', combined_mean_pct: 87 },
        { code: 'LO2', combined_mean_pct: 73 },
        { code: 'LO3', combined_mean_pct: 80 },
        { code: 'LO4', combined_mean_pct: 42 }
      ],
      section_comparison: [
        { section: 'Section 5-A', outcome_code: 'LO4', weak_share_pct: 61 },
        { section: 'Section 5-B', outcome_code: 'LO4', weak_share_pct: 54 }
      ],
      weak_distribution: [
        { outcome_code: 'LO1', strong: 96, developing: 14, weak: 4 },
        { outcome_code: 'LO2', strong: 74, developing: 28, weak: 12 },
        { outcome_code: 'LO3', strong: 86, developing: 20, weak: 8 },
        { outcome_code: 'LO4', strong: 16, developing: 32, weak: 66 }
      ],
      prerequisites: [
        { code: 'P1', name: 'Basic Differential Calculus', mastery_pct: 71 },
        { code: 'P2', name: 'Multivariate Chain Rule', mastery_pct: 52 }
      ]
    };
  }

  public draftAcademicRecommendation(outcomeId: number): any {
    const text =
      'Academic Senate Recommendation (AI-Drafted): Across 114 students enrolled in CS-501 (Sections 5-A and 5-B), 58% of learners exhibited sub-threshold mastery in LO4 (Backpropagation). Cross-correlative evidence indicates this directly traces to prerequisite deficit P2 (Chain Rule, currently at 52%). Action: Authorize 2 prerequisite refresher contact hours and integrate adaptive diagnostic formative checks in Lecture 15.';
    const newRec = {
      id: Date.now(),
      text,
      mode: 'LIVE' as const,
      facts: ['58% combined weakness across 114 students', 'P2 Chain Rule deficit at 52%', 'Approved for Faculty Senate Review'],
      createdAt: new Date().toISOString()
    };
    this.state.adminRecommendations.unshift(newRec);

    const user = this.getCurrentUser();
    this.addAiLog(user.name, user.role, 'generate_academic_recommendation', 'gemini-3.8-flash (Academic Engine)', 'OK', 'Drafted university-level recommendation for Faculty Senate');
    this.saveState({ ...this.state });
    return newRec;
  }

  // --- Skill Passport (SC14, CR-06) ---
  public getSkillPassport(studentId: number): SkillPassportData {
    const mastery = this.state.studentMastery[studentId] || INITIAL_STUDENT_MASTERY;
    const lo4 = mastery.find((m) => m.outcome.code === 'LO4');
    // Derived level: if LO4 is WEAK or <70, Neural Networks is Developing; if LO4 is STRONG, it upgrades to Strong
    const neuralNetworkLevel = lo4?.status === 'STRONG' ? 'STRONG' : 'DEVELOPING';

    return {
      profile: 'AI/ML Engineering Learning Profile',
      skills: [
        { name: 'Python for Scientific Computing', level: 'DEVELOPING', source: 'SEEDED' },
        { name: 'Machine Learning Fundamentals', level: 'DEVELOPING', source: 'SEEDED' },
        { name: 'Neural Networks & Deep Learning', level: neuralNetworkLevel, source: 'DERIVED' },
        { name: 'Problem Solving & Algorithmic Design', level: 'STRONG', source: 'SEEDED' },
        { name: 'Deep Learning Architectures & Transformers', level: 'RECOMMENDED_NEXT', source: 'DERIVED' }
      ],
      evidence: [
        { label: 'CS-501 Artificial Intelligence', detail: 'Completed exit quiz with active outcome tracking' },
        { label: 'LO1–LO3 Mastery Verification', detail: 'Consistent Strong mastery in feedforward and activation functions' },
        { label: 'LO4 Backpropagation Verification', detail: `Current verified mastery: ${lo4?.percent || 41}% (${lo4?.status || 'WEAK'})` }
      ],
      career_direction: 'AI/ML Research & Systems Engineer',
      recommended_next_skill: 'Deep Learning & Transformer Architectures',
      provenance: 'MIXED'
    };
  }

  // --- Demo Runner & Lifecycle Derivation (SC18, D01, D02, D03) ---
  public getDemoState(): DemoState {
    const hasPublishedLesson = this.state.lessons.some((l) => l.status === 'PUBLISHED');
    const hasLiveOrEndedSession = Boolean(this.state.activeSession);
    const hasStudentQuizSubmitted = Boolean(this.state.activeSession?.quiz.submitted_count && this.state.activeSession.quiz.submitted_count > 0);
    const hasLiveEvidence = this.state.evidenceEvents.some((e) => e.source_type === 'EXIT_QUIZ' && e.outcome_id === 4);
    const hasPersonalizedPractice = Object.values(this.state.assignedPracticeSets).some((p) => p.length > 0) || this.state.evidenceEvents.some((e) => e.source_type === 'PRACTICE');
    const hasReteachRec = Boolean(this.state.classRecommendations.some((r) => r.type === 'RETEACH' && r.segment));
    const hasAdminRec = this.state.adminRecommendations.length > 0;
    const hasSkillPassportUpdated = Boolean(this.state.studentMastery[101]?.some((m) => m.outcome.code === 'LO4'));

    const steps = [
      {
        n: 1,
        key: 'TEACH',
        label: 'Lecture Builder & Approval Gate',
        done: hasPublishedLesson,
        detail: 'Teacher generates, edits, reviews, approves, and publishes a structured lesson tagged to LO1–LO4.',
        actionLink: '/teacher/lesson-builder'
      },
      {
        n: 2,
        key: 'CLASSROOM',
        label: 'Smart Classroom & Synchronized Join',
        done: hasLiveOrEndedSession,
        detail: 'Teacher launches presenter mode; student joins via QR or link with real-time state synchronization.',
        actionLink: '/teacher/classroom'
      },
      {
        n: 3,
        key: 'ASSESSMENT',
        label: '5-Question Outcome-Tagged Exit Quiz',
        done: hasStudentQuizSubmitted,
        detail: 'Student answers 5 questions on phone/browser; answers are submitted as an atomic evidence transaction.',
        actionLink: '/student/classroom'
      },
      {
        n: 4,
        key: 'INTELLIGENCE',
        label: 'Mastery & Learning Gap Computation',
        done: hasLiveEvidence,
        detail: 'System derives deterministic LO1–LO4 mastery: LO4 drops to 41% (Needs Attention) with diagnosed misconception.',
        actionLink: '/student'
      },
      {
        n: 5,
        key: 'PERSONALIZE',
        label: 'Targeted Student Practice & AI Tutor',
        done: hasPersonalizedPractice,
        detail: 'Student reviews 3-step learning gap panel, takes 3 targeted LO4 practice items, and asks grounded AI tutor.',
        actionLink: '/student/practice'
      },
      {
        n: 6,
        key: 'TEACHER_SUPPORT',
        label: 'Teacher Insights & Re-teach Generator',
        done: hasReteachRec,
        detail: 'Teacher views Class Insights (35 students / 61% weak on LO4) and drafts a 10-minute re-teach segment.',
        actionLink: '/teacher/recommendations'
      },
      {
        n: 7,
        key: 'UNIVERSITY',
        label: 'Institutional Intelligence & Governance',
        done: hasAdminRec,
        detail: 'Academic Admin detects 58% combined multi-section recurring gap and drafts an institutional recommendation.',
        actionLink: '/admin'
      },
      {
        n: 8,
        key: 'CAREER',
        label: 'Skill Passport & Career Alignment',
        done: hasSkillPassportUpdated,
        detail: 'Student Skill Passport dynamically derives Neural Networks status and recommends Deep Learning trajectory.',
        actionLink: '/student/skills'
      }
    ];

    const currentStepObj = steps.find((s) => !s.done) || steps[steps.length - 1];

    return {
      steps,
      current_step: currentStepObj.n,
      loop: {
        teach: hasPublishedLesson,
        learn: hasLiveOrEndedSession,
        assess: hasStudentQuizSubmitted,
        understand: hasLiveEvidence,
        personalize: hasPersonalizedPractice,
        support_teacher: hasReteachRec,
        inform_university: hasAdminRec,
        improve: hasPublishedLesson && hasAdminRec
      }
    };
  }

  public resetDemo(): void {
    const fresh = createInitialDbState();
    const user = this.getCurrentUser();
    fresh.currentUserId = user.id;
    fresh.auditLogs.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user: user.name,
      role: user.role,
      action: 'DEMO_RESET',
      entity: 'Platform restored to initial demonstration benchmark state'
    });
    this.saveState(fresh);
  }

  public autofillScriptedQuiz(studentId: number = 101): QuizResult {
    // Scripted answers: Q1, Q2, Q3 correct; Q4, Q5 chosen misconception options
    const scriptedAnswers: QuizSubmissionItem[] = [
      { question_id: 1, option_id: 102 }, // Correct (B)
      { question_id: 2, option_id: 202 }, // Correct (B)
      { question_id: 3, option_id: 302 }, // Correct (B)
      { question_id: 4, option_id: 402 }, // Misconception (B): Output error applied directly
      { question_id: 5, option_id: 503 }  // Misconception (C): Hidden independence
    ];
    return this.submitQuiz('EXIT_QUIZ', scriptedAnswers, studentId, true);
  }
}

export const platformStore = new PlatformCoreStore();
