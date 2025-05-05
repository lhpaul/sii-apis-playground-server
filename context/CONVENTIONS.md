# Project Conventions

This section outlines the coding and file structure conventions used in this repository. Adhering to these guidelines ensures consistency and maintainability.

## Code

## String Literals

This project uses single quotes for string literals to maintain consistency across the codebase. Double quotes should only be used when required, such as for JSON properties or when escaping single quotes within a string.

## Constants Over Hard Coded Values

To ensure maintainability and consistency, always use constants instead of hard-coded values in the codebase. This approach improves readability, reduces duplication, and makes it easier to update values when needed.

### Benefits of Using Constants:

- **Centralized Management**: Constants are defined in a single location, making updates straightforward.
- **Improved Readability**: Named constants provide context, making the code easier to understand.
- **Reduced Errors**: Avoids accidental inconsistencies caused by duplicating hard-coded values.

### Guidelines:

1. Define constants in the `src/constants/` directory if they apply globally or inside a folder when constants only apply to specific context (e.g. `users.service.constants.ts` in the same folder as `users.service.ts`).
2. Use descriptive and meaningful names for constants.

### Example:

```typescript
// filepath: src/constants/app.constants.ts
export const API_BASE_URL = 'https://api.example.com';
export const DEFAULT_PAGE_SIZE = 20;
export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr'];
```

```typescript
// Usage in code
import { API_BASE_URL, DEFAULT_PAGE_SIZE } from '../constants/app.constants';

const fetchUsers = async (page: number) => {
  const response = await fetch(`${API_BASE_URL}/users?page=${page}&size=${DEFAULT_PAGE_SIZE}`);
  return response.json();
};
```

By following these practices, the codebase remains clean, consistent, and easier to maintain. 

### Module Import Order

Maintain a consistent import order within each file:

1. **External Dependencies:**
    * Import all third-party packages first (e.g., `react`, `lodash`, `axios`).
    * Sort these alphabetically. Treat scoped packages or path aliases beginning with `@` (e.g., `@nestjs/common`, `@components`) as preceding other letters.
2. **Internal Project Modules:**
    * Import modules from within this project after external dependencies.
    * Primary sort criterion: Relative path depth. Imports from higher-level directories (e.g., `../../../config`) come before those from closer directories (e.g., `../services`, `./utils`).
    * Secondary sort criterion: Alphabetical order for modules at the same path depth.

**Example:**

```typescript
// External dependencies (alphabetical, @ first)
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as bcrypt from 'bcrypt';

// Internal modules (farthest path first, then alphabetical)
import { AppConfig } from '../../../config';
import { DatabaseService } from '../../database/database.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { hashPassword } from './utils/security.utils';
```

### File Naming Suffixes

Use the following suffixes in filenames (before the extension, e.g., `users.service.ts`) to indicate the file's purpose:

- `.constants.ts`: Contains constant values. No logic should be included.
- `.errors.ts`: Defines custom error classes with minimal logic.
- `.interfaces.ts`: Holds TypeScript interfaces and type definitions. No logic should be included.
- `.service.ts`: Implements classes that encapsulate core business logic or interact with data sources.
- `.utils.ts`: Contains reusable utility functions, typically pure and stateless.
- `.class.ts`: Defines utility classes.
- `.mocks.ts`: Provides mock classes, constants, or functions for testing purposes.

## Logging

### Log Structure

Logs should follow a consistent structure to ensure clarity and facilitate debugging. Each log entry should include the following fields:

- **id**: A unique string identifier to correlate logs across different executions.
- **data**: The specific information being logged, such as input parameters, results, or error details.
- **metadata**: Shared contextual information for all logs within a single execution, such as user ID, request ID, or session details. Adding metadata is optional.

By adhering to this structure, logs become more meaningful and easier to filter, analyze, and trace across different executions.

### Monitoring Performance

To effectively monitor performance, wrap asynchronous calls with the `startStep` and `endStep` functions provided by the logger object. These functions generate logs that measure the total time elapsed during execution, making it easier to identify and troubleshoot slow operations.

**Example:**

```typescript
/*
lets assume that the labels of the steps are defined in STEP_LABELS constant like this:
export const STEP_LABELS = {
  UPDATE_USER: 'update-user',
  NOTIFY_USER: 'notify-user',
};
*/
try {
  logger.startStep(STEP_LABELS.UPDATE_USER);
  await usersService.updateUser();
  logger.endStep(STEP_LABELS.UPDATE_USER);
  logger.startStep(STEP_LABELS.NOTIFY_USER);
  await usersService.notifyUser();
  logger.endStep(STEP_LABELS.NOTIFY_USER);
  // Continue with further logic...
} catch (error) {
  logger.endStep(STEP_LABELS.UPDATE_USER);
  logger.endStep(STEP_LABELS.NOTIFY_USER); // if it fails before this step started, It will be ignored
  // Handle the error...
}
```

#### Best Practices:

1. Use meaningful step names to clearly indicate the operation being monitored (e.g., `'update-user'`, `'fetch-data'`).
2. Always ensure `endStep` is called, even in error scenarios, to maintain accurate performance logs.

By following these practices, you can ensure that performance monitoring logs remain clear, consistent, and actionable.

### Masking Sensitive Information

When developing, ensure that sensitive data is properly masked in logs to protect user privacy and security. Sensitive information includes, but is not limited to:

- Credentials, such as passwords or API keys.
- Personally identifiable information (PII), including email addresses, phone numbers, full names, and identification numbers.

When defining a new endpoint (e.g., `src/endpoints/<endpoint-name>/<endpoint-name>.endpoint.ts`), specify the fields to be masked in both request and response logs.

**Example:**

```typescript
export const usersEndpoint: ServerRoute = createEndpoint({
  method: 'POST',
  path: '/users',
  handler: createUserHandler,
}, {
  maskOptions: {
    requestHeaders: ['authorization'],
    requestPayloadFields: ['lastName', 'email', 'phoneNumber'],
    responseHeaders: ['authorization'],
    responsePayloadFields: ['sensitiveField']
  }
});
```

Similarly, when making requests to external APIs, define which fields should be masked in the request and response logs.

**Example:**

```typescript
const { data: responseData, error } = await apiRequest<any>({
  method,
  url,
  payload,
  headers
}, {
  maskOptions: {
    requestPayloadFields: ['email', 'password'],
    requestHeaders: ['x-api-key'],
    responsePayloadFields: ['token']
  }
});
```

For more details, refer to the [IMaskRequestOptions](src/utils/api-requests/api-requests.utils.interfaces.ts) interface in `src/utils/api-requests/api-requests.utils.interfaces.ts`.

## API Best Practices and Naming Conventions

When defining a new endpoint, take in consideration the [API Best Practices and Naming Conventions](https://github.com/saifaustcse/api-best-practices/blob/main/README.md)

In addition to them, we add the following:

- When returning a 500 Internal Server Error, include a specific error code in the response. The purpose of the code is not reveal information to the user but to help developers quickly identify and narrow down the issue when reported.

**Example:**

```typescript
let errorCode = '01';
try {
  logger.startStep(STEP_LABELS.UPDATE_USER);
  await usersService.updateUser();
  logger.endStep(STEP_LABELS.UPDATE_USER);

  logger.startStep(STEP_LABELS.NOTIFY_USER);
  errorCode = '02'; // Update the error code to reflect the current operation
  await usersService.notifyUser();
  logger.endStep(STEP_LABELS.NOTIFY_USER);

  // Continue with further logic...
} catch (error) {
  // Ensure all steps are properly ended, even in case of an error
  logger.endStep(STEP_LABELS.UPDATE_USER);
  logger.endStep(STEP_LABELS.NOTIFY_USER);

  // Return a 500 response with the error code and a generic error message
  return response.response({
    code: errorCode,
    message: INTERNAL_ERROR_MESSAGE,
  }).code(500);
}
```
