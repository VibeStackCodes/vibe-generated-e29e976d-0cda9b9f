export type UserRole = 'viewer' | 'editor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type TokenType = 'number' | 'operator' | 'paren' | 'memory';
export interface Token {
  id: number;
  type: TokenType;
  value: string;
}

export interface CalculatorVersion {
  id: string;
  name: string;
  timestamp: string;
  tokens: Token[];
}

export interface CalculatorTemplate {
  id: string;
  name: string;
  versions: CalculatorVersion[];
  currentTokens: Token[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  meta?: Record<string, unknown>;
}
