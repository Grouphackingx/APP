import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { welcomeUserTemplate } from './templates/welcome-user.template';
import { welcomeHostTemplate } from './templates/welcome-host.template';
import { hostApprovedTemplate } from './templates/host-approved.template';
import { hostRejectedTemplate } from './templates/host-rejected.template';
import { purchaseConfirmationTemplate } from './templates/purchase-confirmation.template';
import { verifyEmailTemplate } from './templates/verify-email.template';
import { resetPasswordTemplate } from './templates/reset-password.template';
import { eventCanceledTemplate } from './templates/event-canceled.template';
import { eventRescheduledTemplate } from './templates/event-rescheduled.template';
import { memberInvitationTemplate } from './templates/member-invitation.template';
import { passwordChangedTemplate } from './templates/password-changed.template';
import { accountCreatedByAdminTemplate } from './templates/account-created-by-admin.template';

export interface TicketInfo {
  ticketId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventCity: string;
  zoneName: string;
  seatNumber: string | number | null;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private fromAddress: string;

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('MAIL_HOST');
    const user = this.config.get<string>('MAIL_USER');
    const pass = this.config.get<string>('MAIL_PASS');

    this.fromAddress = this.config.get<string>('MAIL_FROM') || 'AfroEventos <no-reply@afroeventos.com>';

    if (!host || !user || !pass) {
      this.logger.warn('Mail credentials not configured — email sending is disabled. Set MAIL_HOST, MAIL_USER, MAIL_PASS in .env to enable it.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: Number(this.config.get<string>('MAIL_PORT') ?? 587),
      secure: this.config.get<string>('MAIL_SECURE') === 'true',
      auth: { user, pass },
    });
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) return;
    try {
      await this.transporter.sendMail({ from: this.fromAddress, to, subject, html, encoding: 'utf-8' });
      this.logger.log(`Email sent → ${to} [${subject}]`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${(err as Error).message}`);
    }
  }

  async sendWelcomeUser(to: string, name: string): Promise<void> {
    const siteUrl = this.config.get<string>('NEXT_PUBLIC_SITE_URL') || 'http://localhost:4200';
    await this.send(to, '¡Bienvenido/a a AfroEventos! 🎉', welcomeUserTemplate({ name, siteUrl }));
  }

  async sendWelcomeHost(to: string, name: string, organizationName: string): Promise<void> {
    const hostUrl = this.config.get<string>('NEXT_PUBLIC_HOST_URL') || 'http://localhost:4201';
    await this.send(to, 'Tu solicitud fue recibida — AfroEventos', welcomeHostTemplate({ name, organizationName, hostUrl }));
  }

  async sendHostApproved(to: string, name: string, organizationName: string): Promise<void> {
    const hostUrl = this.config.get<string>('NEXT_PUBLIC_HOST_URL') || 'http://localhost:4201';
    await this.send(to, '¡Tu cuenta de organizador fue aprobada! 🎊', hostApprovedTemplate({ name, organizationName, hostUrl }));
  }

  async sendHostRejected(to: string, name: string, organizationName: string, reason?: string): Promise<void> {
    const siteUrl = this.config.get<string>('NEXT_PUBLIC_SITE_URL') || 'http://localhost:4200';
    await this.send(to, 'Actualización sobre tu solicitud — AfroEventos', hostRejectedTemplate({ name, organizationName, reason, siteUrl }));
  }

  async sendEmailVerification(to: string, name: string, token: string): Promise<void> {
    const siteUrl = this.config.get<string>('NEXT_PUBLIC_SITE_URL') || 'http://localhost:4200';
    const verifyUrl = `${siteUrl}/verify-email?token=${token}`;
    await this.send(to, 'Verifica tu correo — AfroEventos', verifyEmailTemplate({ name, verifyUrl, expiresInHours: 24 }));
  }

  async sendPasswordReset(to: string, name: string, token: string): Promise<void> {
    const siteUrl = this.config.get<string>('NEXT_PUBLIC_SITE_URL') || 'http://localhost:4200';
    const resetUrl = `${siteUrl}/reset-password?token=${token}`;
    await this.send(to, 'Restablece tu contraseña — AfroEventos', resetPasswordTemplate({ name, resetUrl, expiresInMinutes: 60 }));
  }

  async sendPasswordChanged(to: string, name: string): Promise<void> {
    const siteUrl = this.config.get<string>('NEXT_PUBLIC_SITE_URL') || 'http://localhost:4200';
    const resetUrl = `${siteUrl}/forgot-password`;
    await this.send(to, 'Tu contraseña fue actualizada — AfroEventos', passwordChangedTemplate({ name, resetUrl }));
  }

  async sendEventCanceled(
    to: string,
    buyerName: string,
    eventTitle: string,
    eventDate: string,
    eventLocation: string,
    eventCity: string,
    orderId: string,
  ): Promise<void> {
    const siteUrl = this.config.get<string>('NEXT_PUBLIC_SITE_URL') || 'http://localhost:4200';
    await this.send(
      to,
      `Evento cancelado: ${eventTitle}`,
      eventCanceledTemplate({ buyerName, eventTitle, eventDate, eventLocation, eventCity, orderId, siteUrl }),
    );
  }

  async sendEventRescheduled(
    to: string,
    buyerName: string,
    eventTitle: string,
    oldDate: string,
    newDate: string,
    newLocation: string,
    newCity: string,
  ): Promise<void> {
    const siteUrl = this.config.get<string>('NEXT_PUBLIC_SITE_URL') || 'http://localhost:4200';
    await this.send(
      to,
      `Actualización de fecha: ${eventTitle}`,
      eventRescheduledTemplate({ buyerName, eventTitle, oldDate, newDate, newLocation, newCity, siteUrl }),
    );
  }

  async sendMemberInvitation(
    to: string,
    memberName: string,
    organizationName: string,
    memberRole: 'ADMIN' | 'STAFF',
    email: string,
    password: string,
  ): Promise<void> {
    const hostUrl = this.config.get<string>('NEXT_PUBLIC_HOST_URL') || 'http://localhost:4201';
    await this.send(
      to,
      `Fuiste agregado al equipo de ${organizationName} — AfroEventos`,
      memberInvitationTemplate({ memberName, organizationName, memberRole, email, password, loginUrl: hostUrl }),
    );
  }

  async sendAccountCreatedByAdmin(
    to: string,
    name: string,
    email: string,
    password: string,
    role: 'HOST' | 'ADMIN' | 'EDITOR',
    organizationName?: string,
  ): Promise<void> {
    const isHost = role === 'HOST';
    const loginUrl = isHost
      ? (this.config.get<string>('NEXT_PUBLIC_HOST_URL') || 'http://localhost:4201')
      : (this.config.get<string>('NEXT_PUBLIC_ADMIN_URL') || 'http://localhost:4202');
    await this.send(
      to,
      '¡Tu cuenta en AfroEventos está lista! — Accede ahora',
      accountCreatedByAdminTemplate({ name, email, password, role, organizationName, loginUrl }),
    );
  }

  async sendPurchaseConfirmation(
    to: string,
    name: string,
    tickets: TicketInfo[],
    totalAmount: number,
    orderId: string,
  ): Promise<void> {
    const siteUrl = this.config.get<string>('NEXT_PUBLIC_SITE_URL') || 'http://localhost:4200';
    await this.send(
      to,
      '¡Tus entradas están listas! 🎟️',
      purchaseConfirmationTemplate({ name, tickets, totalAmount, orderId, siteUrl }),
    );
  }
}
