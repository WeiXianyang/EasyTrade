import auditLogService from './auditLogService.js';
import requestLogService from './requestLogService.js';

function actorSnapshot(actor) {
  return {
    actorId: actor?.id || 'guest',
    actorName: actor?.name || actor?.username || '访客',
    actorRole: actor?.role || 'guest',
  };
}

function now() {
  return globalThis.performance?.now ? globalThis.performance.now() : Date.now();
}

/**
 * Synchronous mock API facade for the localStorage-backed project.
 *
 * UI code can keep simple synchronous flows while still producing realistic
 * endpoint, status, timing, and audit records for defense walkthroughs.
 */
export function createMockApiService(requestLogs = requestLogService, auditLogs = auditLogService) {
  function request(options) {
    const {
      action,
      actor,
      handler,
      method = 'GET',
      moduleName = '系统',
      path = '/',
      successStatus = method.toUpperCase() === 'POST' ? 201 : 200,
      target = '-',
    } = options;
    const startedAt = now();
    const actorInfo = actorSnapshot(actor);

    try {
      const data = handler();
      const durationMs = Math.max(1, Math.round(now() - startedAt));

      requestLogs.recordRequest({
        method,
        path,
        status: successStatus,
        durationMs,
        moduleName,
        ...actorInfo,
      });

      if (action) {
        auditLogs.recordAudit({
          action,
          target,
          moduleName,
          status: 'success',
          detail: `${method.toUpperCase()} ${path}`,
          ...actorInfo,
        });
      }

      return data;
    } catch (error) {
      const durationMs = Math.max(1, Math.round(now() - startedAt));
      const errorMessage = error?.message || '未知错误';

      requestLogs.recordRequest({
        method,
        path,
        status: error?.statusCode || 500,
        durationMs,
        moduleName,
        errorMessage,
        ...actorInfo,
      });

      if (action) {
        auditLogs.recordAudit({
          action,
          target,
          moduleName,
          status: 'failed',
          detail: errorMessage,
          ...actorInfo,
        });
      }

      throw error;
    }
  }

  return { request };
}

const mockApiService = createMockApiService();
export default mockApiService;
