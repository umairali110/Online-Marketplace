import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SmtpService {
  private logger = new Logger(SmtpService.name);

  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for STARTTLS (587)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  private async send(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL,
        to,
        subject,
        html,
      });
      this.logger.log(`Email "${subject}" sent to ${to} (messageId: ${info.messageId})`);
    } catch (error: any) {
      // Never throw from here — a failed email should never break registration,
      // checkout, or any other flow that happens to trigger a notification.
      this.logger.error(`SMTP failed to send "${subject}" to ${to}: ${error.message}`);
    }
  }

  async sendOtpEmail(to: string, name: string, code: string) {
    await this.send(
      to,
      'Verify your Online Marketplace account',
      `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
          <h2>Hi ${name},</h2>
          <p>Your verification code is:</p>
          <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px;">${code}</p>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    );
  }

  async sendPasswordResetEmail(to: string, name: string, code: string) {
    await this.send(
      to,
      'Reset your Online Marketplace password',
      `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
          <h2>Hi ${name},</h2>
          <p>Use this code to reset your password:</p>
          <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px;">${code}</p>
          <p>This code expires in 15 minutes. If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    );
  }

  async sendPlainEmail(to: string, subject: string, body: string) {
    await this.send(to, subject, `<div style="font-family: sans-serif;"><p>${body}</p></div>`);
  }
}