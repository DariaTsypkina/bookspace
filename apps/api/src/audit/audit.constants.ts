export const AUDIT_ENTITY = {
  CONTEXT_READING: 'ContextReading',
} as const;

export const AUDIT_ACTION = {
  CONTEXT_UPDATE: 'CONTEXT_UPDATE',
  CONTEXT_UNPUBLISH: 'CONTEXT_UNPUBLISH',
  CONTEXT_REJECT: 'CONTEXT_REJECT',
} as const;

export type AuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];
