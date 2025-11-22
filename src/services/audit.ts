import type { AuditLogEntry } from '@/types';

const KEY = 'calcforge.audit_logs';

export function getAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuditLogEntry[]) : [];
  } catch {
    return [];
  }
}

export function logAudit(message: string, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO', meta?: Record<string, unknown>) {
  const logs = getAuditLogs();
  const entry: AuditLogEntry = {
    id: Math.random().toString(36).slice(2),
    timestamp: new Date().toISOString(),
    level,
    message,
    meta
  };
  logs.push(entry);
  localStorage.setItem(KEY, JSON.stringify(logs));
}
