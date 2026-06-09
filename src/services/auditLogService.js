import storageService from './storageService.js';

const MAX_AUDIT_LOGS = 80;

function createId() {
  return `audit-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function normalizeAuditLog(log) {
  return {
    id: log.id || createId(),
    actorId: log.actorId || 'system',
    actorName: log.actorName || '系统',
    actorRole: log.actorRole || 'system',
    moduleName: log.moduleName || '系统',
    action: log.action || '记录操作',
    target: log.target || '-',
    status: log.status || 'success',
    detail: log.detail || '',
    createdAt: log.createdAt || new Date().toLocaleString(),
  };
}

/**
 * Records business-level admin actions. Request logs answer "which endpoint";
 * audit logs answer "who changed which piece of business state".
 */
export function createAuditLogService(storage = storageService) {
  function readLogs() {
    return storage.read(storage.keys.auditLogs, []);
  }

  function writeLogs(logs) {
    return storage.write(storage.keys.auditLogs, logs.slice(0, MAX_AUDIT_LOGS).map(normalizeAuditLog));
  }

  return {
    getAuditLogs(limit = MAX_AUDIT_LOGS) {
      return readLogs().slice(0, limit);
    },
    recordAudit(log) {
      const nextLog = normalizeAuditLog(log);
      writeLogs([nextLog, ...readLogs()]);
      return nextLog;
    },
    clearAuditLogs() {
      writeLogs([]);
    },
  };
}

const auditLogService = createAuditLogService();
export default auditLogService;
