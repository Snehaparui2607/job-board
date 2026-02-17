import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Email configuration
const createTransporter = (): Transporter | null => {
  // Skip email in development if not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Email not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const transporter = createTransporter();

// Email templates
const getBaseTemplate = (content: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JobBoard Notification</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white !important;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 8px 8px;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
    }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-reviewed { background: #dbeafe; color: #1e40af; }
    .status-accepted { background: #d1fae5; color: #065f46; }
    .status-rejected { background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <div class="header">
    <h1>JobBoard</h1>
  </div>
  <div class="content">
    ${content}
  </div>
  <div class="footer">
    <p>This is an automated message from JobBoard.</p>
    <p>&copy; ${new Date().getFullYear()} JobBoard. All rights reserved.</p>
  </div>
</body>
</html>
`;

// Send email helper
const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string
): Promise<boolean> => {
  if (!transporter) {
    console.log(`[Email Skipped] To: ${to}, Subject: ${subject}`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"JobBoard" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: getBaseTemplate(htmlContent),
    });
    console.log(`[Email Sent] To: ${to}, Subject: ${subject}`);
    return true;
  } catch (error) {
    console.error('[Email Error]', error);
    return false;
  }
};

// Notification: New application received (to employer)
export const sendNewApplicationNotification = async (
  employerEmail: string,
  employerName: string,
  candidateName: string,
  jobTitle: string,
  applicationId: string
): Promise<boolean> => {
  const subject = `New Application for ${jobTitle}`;
  const content = `
    <h2>New Application Received!</h2>
    <p>Hello ${employerName},</p>
    <p>Great news! <strong>${candidateName}</strong> has applied for the position of <strong>${jobTitle}</strong>.</p>
    <p>Log in to your dashboard to review the application and candidate details.</p>
    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/employer" class="button">
      View Application
    </a>
    <p>Don't keep candidates waiting too long - quick responses improve your employer brand!</p>
  `;

  return sendEmail(employerEmail, subject, content);
};

// Notification: Application status update (to candidate)
export const sendApplicationStatusNotification = async (
  candidateEmail: string,
  candidateName: string,
  jobTitle: string,
  companyName: string,
  status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED'
): Promise<boolean> => {
  const statusMessages: Record<string, { subject: string; message: string; className: string }> = {
    PENDING: {
      subject: `Application Received: ${jobTitle}`,
      message: 'Your application has been received and is pending review.',
      className: 'status-pending',
    },
    REVIEWED: {
      subject: `Application Update: ${jobTitle}`,
      message: 'Your application is being reviewed by the hiring team.',
      className: 'status-reviewed',
    },
    ACCEPTED: {
      subject: `Congratulations! Application Accepted: ${jobTitle}`,
      message: 'Congratulations! Your application has been accepted. The employer will be in touch soon.',
      className: 'status-accepted',
    },
    REJECTED: {
      subject: `Application Update: ${jobTitle}`,
      message: 'Unfortunately, they have decided to move forward with other candidates at this time.',
      className: 'status-rejected',
    },
  };

  const statusInfo = statusMessages[status];
  const subject = statusInfo.subject;
  const content = `
    <h2>Application Status Update</h2>
    <p>Hello ${candidateName},</p>
    <p>There's an update on your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
    <p>
      <span class="status-badge ${statusInfo.className}">
        ${status}
      </span>
    </p>
    <p>${statusInfo.message}</p>
    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/candidate" class="button">
      View Your Applications
    </a>
    ${status === 'REJECTED' ? '<p>Keep applying - your perfect opportunity is out there!</p>' : ''}
  `;

  return sendEmail(candidateEmail, subject, content);
};

// Notification: Welcome email (to new user)
export const sendWelcomeEmail = async (
  email: string,
  firstName: string,
  role: 'CANDIDATE' | 'EMPLOYER'
): Promise<boolean> => {
  const subject = 'Welcome to JobBoard!';
  const roleMessage =
    role === 'EMPLOYER'
      ? 'You can now post jobs and find the best candidates for your company.'
      : 'You can now browse and apply for amazing job opportunities.';

  const dashboardUrl =
    role === 'EMPLOYER'
      ? `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/employer`
      : `${process.env.CLIENT_URL || 'http://localhost:5173'}/jobs`;

  const buttonText = role === 'EMPLOYER' ? 'Post Your First Job' : 'Browse Jobs';

  const content = `
    <h2>Welcome to JobBoard!</h2>
    <p>Hello ${firstName},</p>
    <p>Thank you for joining JobBoard! Your account has been created successfully.</p>
    <p>${roleMessage}</p>
    <a href="${dashboardUrl}" class="button">${buttonText}</a>
    <p>If you have any questions, feel free to reach out to our support team.</p>
    <p>Best of luck!</p>
  `;

  return sendEmail(email, subject, content);
};

export default {
  sendNewApplicationNotification,
  sendApplicationStatusNotification,
  sendWelcomeEmail,
};
