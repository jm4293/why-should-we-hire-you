// AI Provider
export type AIProvider = "openai" | "anthropic" | "google";

export interface APIKey {
  provider: AIProvider;
  key: string;
  model: string;
}

// Persona
export interface Persona {
  id: string;
  name: string;
  role: string;
  description: string;
  provider: AIProvider;
  model: string;
}

// Analysis Input
export interface CompanyInfo {
  companyUrl: string;
  jobUrl: string;
  companyContent?: string;
  jobContent?: string;
  favicon?: string;
}

export interface ResumeFile {
  name: string;
  text: string;
  type: "resume" | "portfolio";
  dataUrl?: string;
}

export interface CoverLetterItem {
  id: string;
  question: string;
  maxLength: number;
}

export interface AnalysisInput {
  companyInfo: CompanyInfo;
  resumeFiles: ResumeFile[];
  coverLetterItems: CoverLetterItem[];
  personas: Persona[];
}

// Analysis Result
export interface CoverLetterSection {
  subTitle: string;
  content: string;
}

export interface CoverLetterAnswer {
  questionId: string;
  question: string;
  sections: CoverLetterSection[];
}

export interface ResumeRevision {
  original: string;
  revised: string;
  reason: string;
}

export interface InterviewerResult {
  personaId: string;
  personaName: string;
  provider: AIProvider;
  model: string;
  summary: string;
  fitReasons: string[];
  weaknesses: string[];
  resumeRevisions: ResumeRevision[];
  coverLetterAnswers: CoverLetterAnswer[];
  status: "pending" | "streaming" | "done" | "error";
  streamText?: string;
  error?: string;
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  companyName: string;
  jobTitle: string;
  companyUrl: string;
  jobUrl: string;
  interviewerResults: InterviewerResult[];
  input: AnalysisInput;
}

// History
export interface HistoryItem {
  id: string;
  createdAt: string;
  companyName: string;
  jobTitle: string;
  companyUrl: string;
  providers: AIProvider[];
  result: AnalysisResult;
}

// Draft (임시저장)
export interface DraftData {
  step: number;
  companyInfo: Partial<CompanyInfo>;
  resumeFiles: ResumeFile[];
  coverLetterItems: CoverLetterItem[];
  personas: Persona[];
  updatedAt: string;
}
