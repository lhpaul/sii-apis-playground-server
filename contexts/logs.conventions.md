# Logs Conventions

This document outlines the logging conventions used in this repository. Adhering to these guidelines ensures consistency and maintainability.

## Required Fields

Production logs should always define a `logId` field with a unique string identifier (unique in an execution) to correlate logs across different executions.

**Example:**

```typescript
/*
lets assume that the values are defined a constant like this:
export const RESOURCE_NOT_FOUND_ERROR = {
    logId: 'resource-not-found',
    logMessage: 'The requested resource was not found',
}
*/
request.log.warn({
  logId: RESOURCE_NOT_FOUND_ERROR.logId,
  requestId: request.id,
  url: request.url
}, RESOURCE_NOT_FOUND_ERROR.logMessage);
```

## Monitoring Performance

To effectively monitor performance, wrap asynchronous calls with the `startStep` and `endStep` functions provided by the logger object. These functions generate logs that measure the total time elapsed during execution, making it easier to identify and troubleshoot slow operations.

**Example:**

```typescript
/*
lets assume that the STEPS constant is defined like this:
export const STEPS = {
  UPDATE_USER: { id: 'proxy-request', obfuscatedId: '01' },
  NOTIFY_USER: { id: 'notify-user', obfuscatedId: '02' }
};
*/
try {
  logger.startStep(STEPS.UPDATE_USER.id, STEPS.UPDATE_USER.obfuscatedId);
  await usersService.updateUser();
  logger.endStep(STEP_LABELS.UPDATE_USER.id);
  logger.startStep(STEP_LABELS.NOTIFY_USER.id, STEP_LABELS.NOTIFY_USER.obfuscatedId);
  await usersService.notifyUser();
  logger.endStep(STEP_LABELS.NOTIFY_USER.id);
  // Continue with further logic...
} catch (error) {
  logger.endStep(STEP_LABELS.UPDATE_USER.id);
  logger.endStep(STEP_LABELS.NOTIFY_USER.id); // if it fails before this step started, It will be ignored
  // Handle the error...
}
```

### Best Practices

1. Use meaningful step names to clearly indicate the operation being monitored (e.g., `'update-user'`, `'fetch-data'`).
2. Always ensure `endStep` is called, even in error scenarios, to maintain accurate performance logs.

By following these practices, you can ensure that performance monitoring logs remain clear, consistent, and actionable.
