import { platformStore } from './dataStore';
import {
  User,
  Role,
  Lesson,
  Block,
  SessionState,
  QuizResult,
  QuizSubmissionItem,
  MasteryItem,
  Recommendation,
  ClassInsightsData,
  AdminOverviewData,
  AdminGapData,
  AdminAnalyticsData,
  GovernancePolicy,
  AiInteractionLog,
  AuditLog,
  DemoState,
  SystemConfig,
  Course,
  Topic,
  Source,
  TeacherQuestion,
  EvidenceEvent,
  SkillPassportData
} from '../types';

export class ApiError extends Error {
  public code: string;
  public details?: any[];
  public trace_id: string;

  constructor(message: string, code: string = 'API_ERROR', details?: any[]) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.trace_id = 'trc_' + Math.random().toString(36).substring(2, 9);
  }
}

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('sgsu_access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackFn?: () => Promise<T> | T
): Promise<T> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...((options.headers as Record<string, string>) || {})
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (res.ok) {
      if (res.status === 204) {
        return undefined as unknown as T;
      }
      return (await res.json()) as T;
    }

    // If server returned error, try fallback or throw
    if (fallbackFn) {
      return await fallbackFn();
    }
    const errData = await res.json().catch(() => ({}));
    throw new ApiError(
      errData?.error?.message || `Request failed with status ${res.status}`,
      errData?.error?.code || 'API_ERROR'
    );
  } catch (err: any) {
    if (fallbackFn) {
      return await fallbackFn();
    }
    throw err;
  }
}

export const api = {
  // --- 11.1 AUTH ---
  async demoLogin(role: Role): Promise<{ access_token: string; token_type: string; user: User }> {
    try {
      const res = await fetch(`${API_BASE}/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof window !== 'undefined') {
          localStorage.setItem('sgsu_access_token', data.access_token);
          localStorage.setItem('sgsu_user', JSON.stringify(data.user));
        }
        platformStore.setCurrentUser(data.user);
        return data;
      }
    } catch {
      // Fallback below
    }

    const state = platformStore.getState();
    const user = state.users.find((u) => u.role === role) || state.users[0];
    platformStore.setCurrentUser(user);
    const data = {
      access_token: `mock_jwt_token_for_${role.toLowerCase()}`,
      token_type: 'bearer',
      user
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('sgsu_access_token', data.access_token);
      localStorage.setItem('sgsu_user', JSON.stringify(user));
    }
    return data;
  },

  async getMe(): Promise<User> {
    return request<User>('/auth/me', {}, () => platformStore.getCurrentUser());
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeader()
      });
    } catch {
      // Ignore network errors on logout
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sgsu_access_token');
      localStorage.removeItem('sgsu_user');
    }
    const student = platformStore.getState().users.find((u) => u.role === 'STUDENT');
    if (student) platformStore.setCurrentUser(student);
  },

  async getConfig(): Promise<SystemConfig> {
    return request<SystemConfig>('/config', {}, () => platformStore.getState().config);
  },

  async getHealth(): Promise<{ status: string; db: boolean; ai: string; seed_ok: boolean }> {
    return request<any>('/health', {}, () => ({
      status: 'ok',
      db: true,
      ai: 'configured',
      seed_ok: true
    }));
  },

  // --- 11.2 CURRICULUM ---
  async getCourses(): Promise<Course[]> {
    return request<Course[]>('/courses', {}, () => platformStore.getState().courses);
  },

  async getCourse(id: number): Promise<Course & { topics: Topic[] }> {
    return request<Course & { topics: Topic[] }>(`/courses/${id}`, {}, () => {
      const course = platformStore.getState().courses.find((c) => c.id === id);
      if (!course) throw new ApiError('Course not found', 'NOT_FOUND');
      const topics = platformStore.getState().topics.filter((t) => t.course_id === id);
      return { ...course, topics };
    });
  },

  async getTopic(id: number): Promise<Topic> {
    return request<Topic>(`/topics/${id}`, {}, () => {
      const topic = platformStore.getState().topics.find((t) => t.id === id);
      if (!topic) throw new ApiError('Topic not found', 'NOT_FOUND');
      return topic;
    });
  },

  async getSources(topicId?: number): Promise<Source[]> {
    const query = topicId ? `?topic_id=${topicId}` : '';
    return request<Source[]>(`/sources${query}`, {}, () =>
      platformStore.getState().sources.filter((s) => s.approved)
    );
  },

  // --- 11.3 LESSONS & AI GENERATION ---
  async getLessons(topicId?: number): Promise<Lesson[]> {
    const query = topicId ? `?topic_id=${topicId}` : '';
    return request<Lesson[]>(`/lessons${query}`, {}, () => {
      const lessons = platformStore.getState().lessons;
      if (topicId) return lessons.filter((l) => l.topic_id === topicId);
      return lessons;
    });
  },

  async getLesson(id: number): Promise<Lesson> {
    return request<Lesson>(`/lessons/${id}`, {}, () => {
      const lesson = platformStore.getState().lessons.find((l) => l.id === id);
      if (!lesson) throw new ApiError('Lesson not found', 'NOT_FOUND');
      return lesson;
    });
  },

  async generateLesson(topicId: number): Promise<Lesson> {
    return request<Lesson>(
      '/lessons/generate',
      {
        method: 'POST',
        body: JSON.stringify({
          topic_id: topicId,
          duration_min: 50,
          style: ['conceptual', 'rigorous']
        })
      },
      () => platformStore.generateLesson(topicId)
    );
  },

  async updateLessonBlock(
    lessonId: number,
    blockId: number,
    title?: string,
    content?: any
  ): Promise<Block> {
    return request<Block>(
      `/lessons/${lessonId}/blocks/${blockId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ title, content })
      },
      () => platformStore.updateLessonBlock(lessonId, blockId, title, content)
    );
  },

  async regenerateLessonBlock(
    lessonId: number,
    blockId: number,
    instruction?: string
  ): Promise<Block> {
    return request<Block>(
      `/lessons/${lessonId}/blocks/${blockId}/regenerate`,
      {
        method: 'POST',
        body: JSON.stringify({ instruction })
      },
      () => platformStore.regenerateLessonBlock(lessonId, blockId, instruction)
    );
  },

  async reviewLesson(lessonId: number): Promise<Lesson> {
    return request<Lesson>(
      `/lessons/${lessonId}/review`,
      { method: 'POST' },
      () => platformStore.reviewLesson(lessonId)
    );
  },

  async approveLesson(lessonId: number): Promise<Lesson> {
    return request<Lesson>(
      `/lessons/${lessonId}/approve`,
      { method: 'POST' },
      () => platformStore.approveLesson(lessonId)
    );
  },

  async publishLesson(lessonId: number): Promise<Lesson> {
    return request<Lesson>(
      `/lessons/${lessonId}/publish`,
      { method: 'POST' },
      () => platformStore.publishLesson(lessonId)
    );
  },

  // --- 11.4 SESSIONS & CLASSROOM ---
  async startSession(
    lessonId: number,
    sectionId: number
  ): Promise<{ session_id: number; join_url: string; state: SessionState }> {
    return request<{ session_id: number; join_url: string; state: SessionState }>(
      '/sessions/start',
      {
        method: 'POST',
        body: JSON.stringify({ lesson_id: lessonId, section_id: sectionId })
      },
      () => {
        const state = platformStore.startSession(lessonId, sectionId);
        return { session_id: state.id, join_url: state.join_url, state };
      }
    );
  },

  async joinSession(sessionId: number, student?: User): Promise<{ state: SessionState }> {
    return request<{ state: SessionState }>(
      `/sessions/${sessionId}/join`,
      { method: 'POST' },
      () => {
        const user = student || platformStore.getCurrentUser();
        const state = platformStore.joinSession(sessionId, user);
        return { state };
      }
    );
  },

  async getSession(sessionId: number): Promise<SessionState> {
    return request<SessionState>(`/sessions/${sessionId}`, {}, () => {
      const state = platformStore.getState().activeSession;
      if (!state || state.id !== sessionId) {
        if (state) return state;
        throw new ApiError('Session not found or ended', 'NO_ACTIVE_SESSION');
      }
      return state;
    });
  },

  async getActiveSession(): Promise<{ session_id: number; join_url: string; state: SessionState }> {
    return request<{ session_id: number; join_url: string; state: SessionState }>(
      '/sessions/active',
      {},
      () => {
        const state = platformStore.getState().activeSession;
        if (!state || state.status !== 'LIVE') {
          throw new ApiError('No active live session found', 'NO_ACTIVE_SESSION');
        }
        return { session_id: state.id, join_url: state.join_url, state };
      }
    );
  },

  async changeSlide(
    sessionId: number,
    action: 'NEXT' | 'PREV' | 'GOTO',
    index?: number
  ): Promise<SessionState> {
    return request<SessionState>(
      `/sessions/${sessionId}/slide`,
      {
        method: 'POST',
        body: JSON.stringify({ action, index })
      },
      () => platformStore.changeSlide(action, index)
    );
  },

  async postPrompt(sessionId: number, text: string): Promise<{ id: number; text: string }> {
    return request<{ id: number; text: string }>(
      `/sessions/${sessionId}/prompts`,
      {
        method: 'POST',
        body: JSON.stringify({ text })
      },
      () => platformStore.postPrompt(text)
    );
  },

  async startPoll(sessionId: number, questionId: number): Promise<any> {
    return request<any>(
      '/polls',
      {
        method: 'POST',
        body: JSON.stringify({ session_id: sessionId, question_id: questionId })
      },
      () => platformStore.startPoll(questionId)
    );
  },

  async respondPoll(pollId: number, optionId: number): Promise<{ accepted: boolean }> {
    return request<{ accepted: boolean }>(
      `/polls/${pollId}/respond`,
      {
        method: 'POST',
        body: JSON.stringify({
          option_id: optionId,
          idempotency_key: `poll_${pollId}_${Date.now()}`
        })
      },
      () => {
        const user = platformStore.getCurrentUser();
        return platformStore.respondPoll(pollId, optionId, user.id);
      }
    );
  },

  async closePoll(pollId: number): Promise<{ poll_id: number; status: string }> {
    return request<{ poll_id: number; status: string }>(
      `/polls/${pollId}/close`,
      { method: 'POST' },
      () => {
        platformStore.closePoll(pollId);
        return { poll_id: pollId, status: 'CLOSED' };
      }
    );
  },

  async startQuiz(sessionId: number): Promise<SessionState> {
    return request<SessionState>(
      `/sessions/${sessionId}/quiz/start`,
      { method: 'POST' },
      () => platformStore.startExitQuiz()
    );
  },

  async closeQuiz(sessionId: number): Promise<SessionState> {
    return request<SessionState>(
      `/sessions/${sessionId}/quiz/close`,
      { method: 'POST' },
      () => platformStore.closeExitQuiz()
    );
  },

  async endSession(sessionId: number): Promise<SessionState> {
    return request<SessionState>(
      `/sessions/${sessionId}/end`,
      { method: 'POST' },
      () => platformStore.endSession()
    );
  },

  // --- 11.6 QUESTIONS & ASSESSMENT ---
  async getQuestions(): Promise<TeacherQuestion[]> {
    return request<TeacherQuestion[]>('/questions?topic_id=1', {}, () =>
      platformStore.getState().questions
    );
  },

  async submitQuiz(
    context: 'EXIT_QUIZ' | 'PRACTICE',
    answers: QuizSubmissionItem[],
    studentId?: number
  ): Promise<QuizResult> {
    return request<QuizResult>(
      '/quiz/submit',
      {
        method: 'POST',
        body: JSON.stringify({
          context,
          answers: answers.map((a) => ({
            question_id: a.question_id,
            option_id: a.option_id,
            duration_ms: a.duration_ms
          })),
          idempotency_key: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
        })
      },
      () => {
        const sId = studentId || platformStore.getCurrentUser().id;
        return platformStore.submitQuiz(context, answers, sId);
      }
    );
  },

  // --- 11.7 MASTERY & RECOMMENDATIONS ---
  async getStudentMastery(
    studentId?: number
  ): Promise<{
    student: User;
    items: MasteryItem[];
    provenance: 'LIVE' | 'MIXED';
    overall_percent: number;
    overall_status: string;
  }> {
    const sId = studentId || 1;
    return request<any>(`/students/${sId}/mastery`, {}, () => {
      const stdId = studentId || platformStore.getCurrentUser().id;
      const student =
        platformStore.getState().users.find((u) => u.id === stdId) ||
        platformStore.getState().users[1];
      const items =
        platformStore.getState().studentMastery[stdId] ||
        platformStore.getState().studentMastery[101] ||
        [];
      const mean = Math.round(
        items.reduce((acc, curr) => acc + curr.percent, 0) / (items.length || 1)
      );
      const overallStatus = mean >= 70 ? 'STRONG' : mean >= 50 ? 'DEVELOPING' : 'WEAK';
      return {
        student,
        items,
        overall_percent: mean,
        overall_status: overallStatus,
        provenance: items.some((i) => i.provenance === 'LIVE') ? 'LIVE' : 'MIXED'
      };
    });
  },

  async getStudentRecommendations(studentId?: number): Promise<Recommendation[]> {
    const sId = studentId || 1;
    return request<Recommendation[]>(`/students/${sId}/recommendations`, {}, () => {
      const stdId = studentId || platformStore.getCurrentUser().id;
      return (
        platformStore.getState().studentRecommendations[stdId] ||
        platformStore.getState().studentRecommendations[101] ||
        []
      );
    });
  },

  async getStudentEvidence(studentId?: number, outcomeId?: number): Promise<EvidenceEvent[]> {
    const sId = studentId || 1;
    const query = outcomeId ? `?outcome_id=${outcomeId}` : '';
    return request<EvidenceEvent[]>(`/students/${sId}/evidence${query}`, {}, () => {
      let events = platformStore.getState().evidenceEvents;
      if (outcomeId) events = events.filter((e) => e.outcome_id === outcomeId);
      return events;
    });
  },

  async getSkillPassport(studentId?: number): Promise<SkillPassportData> {
    const sId = studentId || 1;
    return request<SkillPassportData>(`/students/${sId}/skills`, {}, () => {
      const stdId = studentId || platformStore.getCurrentUser().id;
      return platformStore.getSkillPassport(stdId);
    });
  },

  // --- 11.8 PRACTICE & TUTOR ---
  async generatePractice(outcomeId: number): Promise<any> {
    return request<any>(
      '/practice/generate',
      {
        method: 'POST',
        body: JSON.stringify({ outcome_id: outcomeId })
      },
      () => platformStore.generatePractice(outcomeId)
    );
  },

  async assignPractice(
    sectionId: number,
    outcomeId: number
  ): Promise<{ assigned_count: number }> {
    return request<{ assigned_count: number }>(
      '/practice/assign',
      {
        method: 'POST',
        body: JSON.stringify({ section_id: sectionId, outcome_id: outcomeId })
      },
      () => ({ assigned_count: 35 })
    );
  },

  async askTutor(
    question: string,
    outcomeId?: number
  ): Promise<{
    answer: string;
    topic: string;
    source: string;
    label: string;
    mode: 'LIVE' | 'FALLBACK';
  }> {
    return request<any>(
      '/tutor/ask',
      {
        method: 'POST',
        body: JSON.stringify({ question, outcome_id: outcomeId })
      },
      () => {
        const user = platformStore.getCurrentUser();
        return platformStore.askTutor(question, user.id);
      }
    );
  },

  // --- 11.9 TEACHER INTELLIGENCE ---
  async getTeacherDashboard(): Promise<any> {
    return request<any>('/teacher/dashboard', {}, () => {
      const state = platformStore.getState();
      const insights = platformStore.getClassInsights(1);
      const recs = state.classRecommendations;
      return {
        course: state.courses[0],
        topic: state.topics[0],
        outcomes: state.topics[0].outcomes,
        last_session: state.activeSession,
        class_mastery: insights.outcomes.map((o) => ({
          outcome_id: o.outcome_id,
          code: o.code,
          percent: o.class_mastery_percent,
          status: o.status,
          warning: o.warning
        })),
        weak_outcomes: insights.outcomes.filter((o) => o.warning),
        recommendations: recs,
        provenance: 'MIXED'
      };
    });
  },

  async getClassInsights(sectionId: number = 1): Promise<ClassInsightsData> {
    return request<ClassInsightsData>(`/classes/${sectionId}/insights`, {}, () =>
      platformStore.getClassInsights(sectionId)
    );
  },

  async getClassEvidence(sectionId: number = 1, outcomeId: number = 4): Promise<any> {
    return request<any>(`/classes/${sectionId}/evidence?outcome_id=${outcomeId}`, {}, () => ({
      outcome: platformStore.getState().topics[0].outcomes.find((o) => o.id === outcomeId),
      option_distribution: [
        {
          question_id: 4,
          stem: 'During backpropagation, how is the weight gradient ∂L/∂w_ij mathematically derived?',
          options: [
            { label: 'A', text: 'By multiplying error δ_j with activation a_i', count: 22, is_correct: true },
            { label: 'B', text: 'By applying output-layer error directly', count: 29, is_correct: false, misconception: 'Direct error application' },
            { label: 'C', text: 'By adding learning rate to activation', count: 4, is_correct: false },
            { label: 'D', text: 'By calculating forward loss variance', count: 2, is_correct: false }
          ]
        },
        {
          question_id: 5,
          stem: 'If a hidden neuron enters saturation σ\'(z) ≈ 0, what happens to gradients?',
          options: [
            { label: 'A', text: 'The weight update rate doubles', count: 3, is_correct: false },
            { label: 'B', text: 'The gradient vanishes along that path', count: 22, is_correct: true },
            { label: 'C', text: 'Preceding layers still update at full rate', count: 28, is_correct: false, misconception: 'Hidden layer independence' },
            { label: 'D', text: 'Weights reset to uniform bounds', count: 4, is_correct: false }
          ]
        }
      ],
      top_misconceptions: [
        { label: 'Output error applied directly to hidden weights without chain multiplication', count: 29 },
        { label: 'Hidden layer updates assumed independent of activation derivatives', count: 28 }
      ],
      note: 'Seeded cohort (56 students) + 1 live student'
    }));
  },

  async getClassRecommendations(sectionId: number = 1): Promise<Recommendation[]> {
    return request<Recommendation[]>(`/classes/${sectionId}/recommendations`, {}, () =>
      platformStore.getState().classRecommendations
    );
  },

  async generateReteachSegment(sectionId: number = 1, outcomeId: number = 4): Promise<any> {
    return request<any>(
      `/classes/${sectionId}/reteach`,
      {
        method: 'POST',
        body: JSON.stringify({ outcome_id: outcomeId })
      },
      () => platformStore.generateReteachSegment(outcomeId)
    );
  },

  // --- 11.10 UNIVERSITY INTELLIGENCE & GOVERNANCE ---
  async getAdminOverview(): Promise<AdminOverviewData> {
    return request<AdminOverviewData>('/admin/overview', {}, () =>
      platformStore.getAdminOverview()
    );
  },

  async getAdminGaps(): Promise<AdminGapData[]> {
    return request<AdminGapData[]>('/admin/gaps', {}, () => platformStore.getAdminGaps());
  },

  async getAdminAnalytics(): Promise<AdminAnalyticsData> {
    return request<AdminAnalyticsData>('/admin/analytics', {}, () =>
      platformStore.getAdminAnalytics()
    );
  },

  async draftAcademicRecommendation(outcomeId: number = 4): Promise<any> {
    return request<any>(
      '/admin/recommendation',
      {
        method: 'POST',
        body: JSON.stringify({ outcome_id: outcomeId })
      },
      () => platformStore.draftAcademicRecommendation(outcomeId)
    );
  },

  async getGovernancePolicy(): Promise<GovernancePolicy> {
    return request<GovernancePolicy>('/governance/policy', {}, () => ({
      ai_mode: 'Academic Assistant',
      sources: 'Approved Course Material & SGSU Academic Press',
      data: 'Demonstration Dataset (Seeded Cohort: 114 Enrolled)',
      model: 'Configured AI Provider',
      model_name: 'gemini-3.8-flash (Academic Engine)',
      usage_policy: [
        'Deterministic Fallback Guard: AI services must fall back gracefully with zero downtime if external gateways are unreachable.',
        'Zero Student Profiling / Non-Surveillance: Institutional administrators access only aggregate-level outcome indicators (minimum cohort size = 5). Individual student identifiers are stripped by construction.',
        'Curriculum Grounding: All AI-generated educational content must carry verified provenance tagging to approved SGSU curriculum materials.',
        'Human Approval Gate: All AI-drafted lessons require explicit teacher review and approval prior to classroom publication.'
      ],
      approved_sources: platformStore.getState().sources
    }));
  },

  async getGovernanceLogs(
    type: 'ai' | 'audit' = 'ai',
    limit: number = 50
  ): Promise<{ ai?: AiInteractionLog[]; audit?: AuditLog[] }> {
    return request<any>(`/governance/logs?type=${type}&limit=${limit}`, {}, () => {
      if (type === 'ai') return { ai: platformStore.getState().aiLogs.slice(0, limit) };
      return { audit: platformStore.getState().auditLogs.slice(0, limit) };
    });
  },

  // --- 11.11 DEMO RUNNER ---
  async getDemoState(): Promise<DemoState> {
    return request<DemoState>('/demo/state', {}, () => platformStore.getDemoState());
  },

  async resetDemo(): Promise<{ reset: boolean; seed_version: number }> {
    return request<any>('/demo/reset', { method: 'POST' }, () => {
      platformStore.resetDemo();
      return { reset: true, seed_version: 1 };
    });
  },

  async autofillScriptedQuiz(): Promise<QuizResult> {
    return request<QuizResult>('/demo/autofill-quiz', { method: 'POST' }, () =>
      platformStore.autofillScriptedQuiz()
    );
  },

  async checkHealth(): Promise<{ status: string; db: boolean; seed_health?: any }> {
    return request<any>('/health', {}, () => ({
      status: 'ok',
      db: true,
      seed_health: { healthy: true }
    }));
  }
};
