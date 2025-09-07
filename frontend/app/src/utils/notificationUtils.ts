// src/utils/notificationUtils.ts

export interface NotificationHandlers {
  openDialog: (config: DialogConfig) => void;
  closeDialog: () => void;
  openSnackbar?: (config: SnackbarConfig) => void;
}

export interface DialogConfig {
  title: string;
  content: string;
  actions: DialogAction[];
}

export interface DialogAction {
  label: string;
  onClick: () => void;
  color: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

export interface SnackbarConfig {
  message: string;
  severity: 'error' | 'warning' | 'success' | 'info';
}

export interface ConfirmActionConfig {
  title?: string;
  content?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

let notificationHandlers: NotificationHandlers = {} as NotificationHandlers;

export function setNotificationHandlers(handlers: NotificationHandlers): void {
  notificationHandlers = handlers;
}

export function confirmAction({
  title,
  content,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmActionConfig): void {
  notificationHandlers.openDialog({
    title: title || 'Confirmación',
    content: content || '¿Está seguro de continuar?',
    actions: [
      {
        label: cancelLabel || 'Cancelar',
        onClick: onCancel || (() => notificationHandlers.closeDialog()),
        color: 'secondary',
      },
      {
        label: confirmLabel || 'Confirmar',
        onClick: onConfirm,
        color: 'primary',
      },
    ],
  });
}

// Error Alert
export function showError(message: string): void {
  notificationHandlers.openSnackbar?.({ message, severity: 'error' });
}

// Warning Message
export function showWarning(message: string): void {
  notificationHandlers.openSnackbar?.({ message, severity: 'warning' });
}

// Success Message
export function showSuccess(message: string): void {
  notificationHandlers.openSnackbar?.({ message, severity: 'success' });
}

// Information Dialog
export function showInfo(message: string): void {
  notificationHandlers.openSnackbar?.({ message, severity: 'info' });
}
