// Types Index
// This file exports all type declarations and interfaces

// Re-export common types from stores
export type { User } from '../stores/authStore';
export type {
  ProcessData,
  ProcessOption,
  Participant,
  Professional,
  Property,
  Neighbor,
} from '../stores/useProcessStore';

// Re-export utility types
export type { ErrorResult, ApiOperationResult } from '../utils/errorHandler';

export type {
  NotificationHandlers,
  DialogConfig,
  SnackbarConfig,
} from '../utils/notificationUtils';
