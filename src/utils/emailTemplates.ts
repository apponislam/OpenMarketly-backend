import { sendMail } from "./sendMail";

export const sendVerificationEmail = (email: string, name: string, otp: string) => {
    const html = `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 550px; margin: 0 auto; padding: 40px 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #6366f1; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">OpenMarketly</h1>
                <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Secure Verification System</p>
            </div>
            
            <div style="border-top: 1px solid #f1f5f9; padding-top: 25px;">
                <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 20px; font-weight: 700;">Hello ${name},</h2>
                <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
                    Thank you for signing up with OpenMarketly! Please use the following 6-digit One-Time Password (OTP) to verify your email address and activate your account.
                </p>
                
                <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
                    <div style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #1e1b4b; text-align: center; font-family: Courier, monospace;">
                        ${otp}
                    </div>
                    <p style="color: #64748b; font-size: 13px; margin: 15px 0 0 0; font-weight: 500;">
                        This code is valid for <strong>10 minutes</strong>.
                    </p>
                </div>
                
                <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 25px 0 0 0;">
                    If you did not request this verification, please ignore this email or contact support if you have security concerns.
                </p>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    &copy; ${new Date().getFullYear()} OpenMarketly. All rights reserved.
                </p>
            </div>
        </div>
    `;
    sendMail(email, "Verify Your Email - OpenMarketly", html);
};

export const sendOtpEmail = (email: string, otp: string, name?: string) => {
    const html = `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #6366f1; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">OpenMarketly</h1>
                <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">One-Time Password Verification</p>
            </div>
            
            <div style="border-top: 1px solid #f1f5f9; padding-top: 25px;">
                <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 20px; font-weight: 700;">${name ? `Hello ${name},` : "Hello,"}</h2>
                <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
                    We received a request to access your account. Please use the following 6-digit One-Time Password (OTP) to proceed.
                </p>
                
                <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
                    <div style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #1e1b4b; text-align: center; font-family: Courier, monospace;">
                        ${otp}
                    </div>
                    <p style="color: #64748b; font-size: 13px; margin: 15px 0 0 0; font-weight: 500;">
                        This code is valid for <strong>10 minutes</strong>.
                    </p>
                </div>
                
                <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 25px 0 0 0;">
                    If you did not request this code, please ignore this email or update your password if you suspect unauthorized access.
                </p>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    &copy; ${new Date().getFullYear()} OpenMarketly. All rights reserved.
                </p>
            </div>
        </div>
    `;
    sendMail(email, "Your OTP Code - OpenMarketly", html);
};

export const sendWelcomeEmail = (email: string, name: string) => {
    const html = `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 550px; margin: 0 auto; padding: 40px 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #6366f1; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">OpenMarketly</h1>
                <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Welcome to the Platform</p>
            </div>
            
            <div style="border-top: 1px solid #f1f5f9; padding-top: 25px; text-align: center;">
                <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 22px; font-weight: 700;">Welcome to OpenMarketly, ${name}! 🎉</h2>
                <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                    We are absolutely thrilled to have you here. OpenMarketly is a multi-vendor platform built to give you the absolute best shopping and selling experience.
                </p>
                <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
                    To get started, please make sure your email is verified using the OTP code sent to you.
                </p>
                
                <div style="display: inline-block; background-color: #f1f5f9; border-radius: 8px; padding: 12px 24px; color: #475569; font-size: 14px; font-weight: 500;">
                    Let's build something great together!
                </div>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    &copy; ${new Date().getFullYear()} OpenMarketly. All rights reserved.
                </p>
            </div>
        </div>
    `;
    sendMail(email, "Welcome to OpenMarketly!", html);
};

export const sendEmailUpdateVerification = (email: string, name: string, verificationUrl: string) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #333;">Hello ${name},</h2>
            <p style="color: #666;">Please verify your new email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify New Email</a>
            </div>
            <p style="color: #999; font-size: 12px;">This link expires in 24 hours.</p>
        </div>
    `;
    sendMail(email, "Verify Your New Email", html);
};

export const sendContactReplyEmail = (email: string, recipientName: string, subject: string, messageContent: string, replyMessage: string) => {
    const html = `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 550px; margin: 0 auto; padding: 40px 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
            <div style="text-align: center; border-bottom: 1px solid #edf2f7; padding-bottom: 20px; margin-bottom: 25px;">
                <h1 style="color: #6366f1; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">OpenMarketly</h1>
                <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Contact Support Response</p>
            </div>
            
            <p style="color: #1e293b; font-size: 16px; line-height: 1.5; margin-top: 0; font-weight: 600;">Hello ${recipientName},</p>
            <p style="color: #475569; font-size: 15px; line-height: 1.5;">This is a response to your inquiry regarding: <strong>"${subject}"</strong>.</p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #cbd5e1; padding: 16px; margin: 20px 0; color: #64748b; font-style: italic; font-size: 14px; border-radius: 4px;">
                "${messageContent}"
            </div>

            <div style="margin: 25px 0; padding: 20px; background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 8px; color: #1e293b; font-size: 15px; line-height: 1.6;">
                <h4 style="margin: 0 0 8px 0; color: #166534; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Support Team Response:</h4>
                ${replyMessage.replace(/\n/g, "<br/>")}
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0 0 5px 0;">
                    This email was sent by OpenMarketly Support. Please do not reply directly to this message.
                </p>
                <p style="color: #cbd5e1; font-size: 11px; margin: 0;">
                    &copy; ${new Date().getFullYear()} OpenMarketly. All rights reserved.
                </p>
            </div>
        </div>
    `;
    sendMail(email, `Re: ${subject} - OpenMarketly Support`, html);
};

export const sendAdminCreatedEmail = (email: string, name: string, tempPassword: string) => {
    const html = `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 550px; margin: 0 auto; padding: 40px 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #6366f1; margin: 0; font-size: 28px; font-weight: 800;">OpenMarketly</h1>
                <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Administrator Account Access</p>
            </div>
            <div style="border-top: 1px solid #f1f5f9; padding-top: 25px;">
                <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 20px; font-weight: 700;">Hello ${name},</h2>
                <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                    An administrator account has been created for you on OpenMarketly. Below are your login credentials:
                </p>
                <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 20px; margin: 20px 0;">
                    <p style="margin: 0 0 8px 0; color: #334155; font-size: 14px;"><strong>Email:</strong> ${email}</p>
                    <p style="margin: 0; color: #334155; font-size: 14px;"><strong>Password:</strong> <span style="font-family: monospace; font-size: 16px; color: #6366f1;">${tempPassword}</span></p>
                </div>
                <p style="color: #64748b; font-size: 13px;">Please log in and change your password immediately for security purposes.</p>
            </div>
        </div>
    `;
    sendMail(email, "Your Administrator Account Credentials - OpenMarketly", html);
};

export const sendPasswordUpdatedByAdminEmail = (email: string, name: string, newPassword: string) => {
    const html = `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 550px; margin: 0 auto; padding: 40px 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #6366f1; margin: 0; font-size: 28px; font-weight: 800;">OpenMarketly</h1>
                <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Security Notice</p>
            </div>
            <div style="border-top: 1px solid #f1f5f9; padding-top: 25px;">
                <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 20px; font-weight: 700;">Hello ${name},</h2>
                <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                    Your account password has been reset by a system administrator. Below is your new password:
                </p>
                <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                    <span style="font-family: monospace; font-size: 20px; font-weight: 700; color: #1e1b4b;">${newPassword}</span>
                </div>
                <p style="color: #64748b; font-size: 13px;">If you did not request this password change, please contact platform support immediately.</p>
            </div>
        </div>
    `;
    sendMail(email, "Your Password Has Been Updated - OpenMarketly", html);
};

export const sendRoleChangedEmail = (email: string, name: string, newRole: string) => {
    const html = `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 550px; margin: 0 auto; padding: 40px 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #6366f1; margin: 0; font-size: 28px; font-weight: 800;">OpenMarketly</h1>
                <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Account Privilege Notice</p>
            </div>
            <div style="border-top: 1px solid #f1f5f9; padding-top: 25px;">
                <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 20px; font-weight: 700;">Hello ${name},</h2>
                <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                    Your account role on OpenMarketly has been updated to <strong>${newRole}</strong>.
                </p>
                <p style="color: #64748b; font-size: 13px;">Your permissions have been adjusted accordingly. Please re-log into your account to access your updated workspace features.</p>
            </div>
        </div>
    `;
    sendMail(email, "Your Account Role Has Changed - OpenMarketly", html);
};
