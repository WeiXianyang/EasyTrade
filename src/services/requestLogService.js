import storageService from './storageService.js';

const MAX_REQUEST_LOGS = 80;

function createId() {
  return `req-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function normalizeRequestLog(log) {
  return {
    id: log.id || createId(),
    method: String(log.method || 'GET').toUpperCase(),
    path: log.path || '/',
    status: Number(log.status || 200),
    durationMs: Number(log.durationMs || 0),
    actorName: log.actorName || '系统',
    actorRole: log.actorRole || 'system',
    moduleName: log.moduleName || '系统',
    errorMessage: log.errorMessage || '',
    createdAt: log.createdAt || new Date().toLocaleString(),
  };
}

/**
 * Persists mock API traffic so the admin console can explain frontend/backend
 * style data flow without requiring a real server in the course submission.
 */
export function createRequestLogService(storage = storageService) {
  function readLogs() {
    return storage.read(storage.keys.requestLogs, []);
  }

  function writeLogs(logs) {
    return storage.write(storage.keys.requestLogs, logs.slice(0, MAX_REQUEST_LOGS).map(normalizeRequestLog));
  }

  return {
    getRequestLogs(limit = MAX_REQUEST_LOGS) {
      return readLogs().slice(0, limit);
    },
    recordRequest(log) {
      const nextLog = normalizeRequestLog(log);
      writeLogs([nextLog, ...readLogs()]);
      return nextLog;
    },
    clearRequestLogs() {
      writeLogs([]);
    },
  };
}

const requestLogService = createRequestLogService();
export default requestLogService;
