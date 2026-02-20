export interface User {
  id: string;
  email: string;
}

export interface Session {
  id: string;
  title: string;
  scenario: string;
  createdAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AuthResponse {
  token: string;
}

export interface ScenarioTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
}
