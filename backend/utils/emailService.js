const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send invitation email
const sendInvitationEmail = async ({
  toEmail,
  inviterName,
  organizationName,
  role,
  inviteToken,
  subdomain,
}) => {
  const transporter = createTransporter();

  // Create invitation link
  const inviteLink = `${process.env.FRONTEND_URL}/accept-invite/${inviteToken}`;

  // Role descriptions
  const roleDescriptions = {
    admin: 'Full access to manage projects, tasks, and team members',
    member: 'Create and manage projects and tasks',
    viewer: 'Read-only access to view projects and tasks',
  };

  const roleDescription = roleDescriptions[role] || 'Access to the platform';

  // Email HTML template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You're Invited to Join ${organizationName}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">You're Invited!</h1>
        </div>

        <div style="padding: 40px 30px;">
          <p style="margin: 0 0 20px; font-size: 16px;">Hi there,</p>
          
          <p style="margin: 0 0 20px; font-size: 16px;">
            <strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on TenantFlow.
          </p>

          <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
            <h2 style="margin: 0 0 10px; color: #667eea; font-size: 20px;">Invitation Details</h2>
            <p style="margin: 5px 0; font-size: 14px; color: #666;">
              <strong>Organization:</strong> ${organizationName}
            </p>
            <p style="margin: 5px 0; font-size: 14px; color: #666;">
              <strong>Your Role:</strong> <span style="text-transform: capitalize;">${role}</span>
            </p>
            <p style="margin: 5px 0; font-size: 14px; color: #666;">
              <strong>Access Level:</strong> ${roleDescription}
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" style="display: inline-block; background: #667eea; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">Accept Invitation</a>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px; color: #333; font-size: 18px;">📝 Getting Started</h3>
            <p style="margin: 10px 0; font-size: 14px;">After accepting, you'll need:</p>
            <p style="margin: 10px 0; font-size: 14px;"><strong>Subdomain:</strong> ${subdomain}</p>
            <p style="margin: 10px 0; font-size: 14px;"><strong>Your Email:</strong> ${toEmail}</p>
            <p style="margin: 10px 0; font-size: 14px;"><strong>Password:</strong> You'll create this during registration</p>
          </div>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            If you weren't expecting this invitation, you can safely ignore this email.
          </p>
        </div>

        <div style="background: #f8f9fa; padding: 30px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #e0e0e0;">
          <p><strong>TenantFlow</strong> - Project Management Made Simple</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
You're Invited to Join ${organizationName}!

${inviterName} has invited you to join ${organizationName} on TenantFlow.

Your Role: ${role}
Access Level: ${roleDescription}

To accept this invitation and create your account, visit:
${inviteLink}

Login Information:
- Subdomain: ${subdomain}
- Email: ${toEmail}
- Password: You'll create this during registration

This invitation will expire in 7 days.

If you weren't expecting this invitation, you can safely ignore this email.

---
TenantFlow - Project Management Made Simple
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: `You're invited to join ${organizationName} on TenantFlow`,
    text: textContent,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Invitation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw error;
  }
};

// ✅ Send notification email
const sendEmailNotification = async ({
  toEmail,
  userName,
  type,
  title,
  message,
  actionByName,
}) => {
  const transporter = createTransporter();

  // Choose icon and color based on type
  let icon = '📋';
  let color = '#667eea';
  let actionText = 'View Details';

  switch (type) {
    case 'task_assigned':
      icon = '✅';
      color = '#10b981';
      actionText = 'View Task';
      break;
    case 'task_completed':
      icon = '🎉';
      color = '#8b5cf6';
      actionText = 'View Task';
      break;
    case 'task_status_changed':
      icon = '🔄';
      color = '#f59e0b';
      actionText = 'View Task';
      break;
    case 'project_updated':
      icon = '📊';
      color = '#3b82f6';
      actionText = 'View Project';
      break;
    case 'team_invite':
      icon = '👥';
      color = '#ec4899';
      actionText = 'View Team';
      break;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: ${color}; padding: 30px 20px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">${icon}</div>
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${title}</h1>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hi ${userName},</p>
          
          <div style="background: #f8f9fa; border-left: 4px solid ${color}; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h2 style="margin: 0 0 10px; color: #333; font-size: 18px;">${message}</h2>
            ${actionByName ? `<p style="margin: 5px 0; font-size: 14px; color: #666;">Action by: <strong>${actionByName}</strong></p>` : ''}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background: ${color}; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">${actionText}</a>
          </div>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            This notification was sent because you have email notifications enabled in your settings.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #e0e0e0;">
          <p><strong>TenantFlow</strong> - Project Management Made Simple</p>
          <p style="margin-top: 10px; font-size: 12px;">
            <a href="${process.env.FRONTEND_URL}/settings" style="color: ${color}; text-decoration: none;">Manage notification preferences</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
${title}

Hi ${userName},

${message}

${actionByName ? `Action by: ${actionByName}` : ''}

Visit TenantFlow to see details: ${process.env.FRONTEND_URL}/dashboard

---
TenantFlow - Project Management Made Simple

Manage your notification preferences: ${process.env.FRONTEND_URL}/settings
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: `${icon} ${title} - TenantFlow`,
    text: textContent,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending notification email:', error);
    throw error;
  }
};

// ✅ Export both functions
module.exports = {
  sendInvitationEmail,
  sendEmailNotification,
};