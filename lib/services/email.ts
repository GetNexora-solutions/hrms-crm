import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: { filename: string; content: Buffer }[];
}

export interface EmailServiceProvider {
  sendEmail(options: EmailOptions): Promise<void>;
}

export class NodemailerProvider implements EmailServiceProvider {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@company.com',
      ...options,
    });
  }
}

export class EmailService {
  private provider: EmailServiceProvider;

  constructor(provider?: EmailServiceProvider) {
    // Default to Nodemailer but allows passing other providers (Resend, SendGrid) later
    this.provider = provider || new NodemailerProvider();
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    await this.provider.sendEmail(options);
  }
}

export const emailService = new EmailService();
