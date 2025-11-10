export enum MessageStatus {
  QUEUED = 'queued',
  SENDING = 'sending', 
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

export enum MessageTemplate {
  RECORDATORIO_24H = 'recordatorio_24h',
  CONFIRMACION = 'confirmacion',
  REAGENDAR = 'reagendar',
  CANCELACION = 'cancelacion'
}

export interface Mensaje {
  id: string;
  pacienteId: string;
  telefono: string;
  mensaje: string;
  template: MessageTemplate;
  status: MessageStatus;
  twilioMessageId?: string;
  tokensCostados: number;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageDto {
  pacienteId: string;
  template: MessageTemplate;
  variables?: Record<string, string>;
}

export interface BulkReminderDto {
  citaIds: string[];
  template: MessageTemplate;
}

export interface MessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  tokensCostados: number;
}

export interface MessageTemplateConfig {
  especialidad: string;
  templates: {
    [key in MessageTemplate]: string;
  };
}

export interface WhatsAppWebhookPayload {
  MessageSid: string;
  MessageStatus: MessageStatus;
  To: string;
  From: string;
  Body?: string;
  Timestamp: string;
}