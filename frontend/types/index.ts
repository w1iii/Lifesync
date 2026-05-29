export interface BriefingModule {
  status?: string;
  error?: string;
}

export interface InboxModule extends BriefingModule {
  totalEmails: number;
  needsAttention: number;
  categorized?: Record<string, unknown>;
  draftReplies?: Array<{ id: string; to: string; subject: string; body: string }>;
}

export interface FinanceModule extends BriefingModule {
  budget?: Record<string, { spent: number; limit: number; percentage: number }>;
  billsDue?: Array<{ name: string; amount: number; dueDate: string; daysUntilDue: number }>;
  unusualCharges?: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    severity: string;
    suggestedAction: string;
  }>;
  totalSpent?: number;
  portfolioChange?: string;
}

export interface ScheduleModule extends BriefingModule {
  todaysMeetings?: Array<{
    id: string;
    title: string;
    start: string;
    end: string;
    priority?: string;
    duration_minutes?: number;
  }>;
  conflicts?: Array<{
    meeting1: string;
    meeting1_title: string;
    meeting2: string;
    meeting2_title: string;
    suggestion: string;
  }>;
  estimatedOverload?: boolean;
  totalMeetings: number;
  totalMeetingMinutes: number;
}

export interface NewsModule extends BriefingModule {
  totalArticles?: number;
  articles?: Array<{ title: string; source: string; url: string; summary: string }>;
  topics?: string[];
}

export interface AnomalyModule extends BriefingModule {
  anomalies?: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    severity: string;
    suggestedAction: string;
  }>;
  totalAnomalies?: number;
  criticalCount?: number;
  highCount?: number;
}

export interface Briefing {
  id: string;
  userId: string;
  summary: string;
  createdAt: string;
  modules: {
    inbox?: InboxModule;
    finance?: FinanceModule;
    schedule?: ScheduleModule;
    news?: NewsModule;
    anomaly?: AnomalyModule;
  };
}

export interface UserPreferences {
  budgets?: Record<string, number>;
  interests?: string[];
  notifications?: boolean;
}

export interface Preferences {
  userId: string;
  briefingTime: { hour: number; minute: number; ampm: string };
  briefingIntensity: number;
  modules: Array<{ id: string; enabled: boolean; priority?: boolean }>;
  connectedServices: string[];
}
