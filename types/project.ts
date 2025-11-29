export interface Project {
  id: string;
  name: string;
  description?: string;
}

export interface QuestionSettings {
  projectId: string | null;
  scheduledTime: string | null; // ISO time string
}

