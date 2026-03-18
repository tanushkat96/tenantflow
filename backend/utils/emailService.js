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
      <link rel="stylesheet" href="./style.css">
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1> You're Invited!</h1>
        </div>

        <!-- Content -->
        <div class="content">
          <p>Hi there,</p>
          
          <p><strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on TenantFlow.</p>

          <!-- Invitation Details -->
          <div class="invitation-box">
            <h2>Invitation Details</h2>
            <p><strong>Organization:</strong> ${organizationName}</p>
            <p><strong>Your Role:</strong> <span class="role-badge">${role}</span></p>
            <p><strong>Access Level:</strong> ${roleDescription}</p>
          </div>

          <!-- What You Can Do -->
          <div class="info-section">
            <h3>What you'll be able to do:</h3>
            ${
              role === 'admin'
                ? `
              <div class="info-item">1.Manage projects and tasks</div>
              <div class="info-item">2.Invite and manage team members</div>
              <div class="info-item">3.View all team activities</div>
              <div class="info-item">4.Assign tasks to team members</div>
            `
                : role === 'member'
                ? `
              <div class="info-item">1.Create and manage projects</div>
              <div class="info-item">2.Create and update tasks</div>
              <div class="info-item">3.Collaborate with team members</div>
              <div class="info-item">4.Track project progress</div>
            `
                : `
              <div class="info-item">1.View all projects and tasks</div>
              <div class="info-item">2.Track team progress</div>
              <div class="info-item">3.Access project reports</div>
              <div class="info-item">4.Receive notifications</div>
            `
            }
          </div>

          <!-- Accept Button -->
          <center>
            <a href="${inviteLink}" class="button">Accept Invitation</a>
          </center>

          <!-- Login Information -->
          <div class="info-section">
            <h3>Getting Started</h3>
            <p style="margin: 10px 0;">After accepting this invitation, you'll need the following to log in:</p>
            <div class="info-item"><strong>Subdomain:</strong> ${subdomain}</div>
            <div class="info-item"><strong>Your Email:</strong> ${toEmail}</div>
            <div class="info-item"><strong>Password:</strong> You'll create this during registration</div>
          </div>

          <!-- Manual Link -->
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <div class="link-box">${inviteLink}</div>

          <!-- Expiry Notice -->
          <div class="expiry-notice">
             <strong>Important:</strong> This invitation will expire in 7 days. Please accept it soon!
          </div>

          <p style="margin-top: 30px;">
            We're excited to have you on board!
          </p>

          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            If you weren't expecting this invitation, you can safely ignore this email.
          </p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p><strong>TenantFlow</strong> - Project Management Made Simple</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Plain text version (fallback)
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

  // Send email
  const mailOptions = {
    from: `${inviterName} via TenantFlow <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `You're invited to join ${organizationName} on TenantFlow`,
    text: textContent,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send invitation email');
  }
};

module.exports = {
  sendInvitationEmail,
};