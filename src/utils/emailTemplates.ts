import { sendMail } from "./nodemailer";

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

export const sendZoomMeetingInvitation = (email: string, name: string, topic: string, meetingId: string, joinUrl: string, startTime: string) => {
    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; background-color: #ffffff;">
            <div style="background-color: #2D8CFF; padding: 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Zoom Meeting Invitation</h1>
            </div>
            <div style="padding: 30px; color: #333333; line-height: 1.6;">
                <h2 style="color: #2D8CFF; margin-top: 0;">Hello ${name},</h2>
                <p style="font-size: 16px;">You have been invited to join a Zoom meeting for the class: <strong>${topic}</strong>.</p>
                
                <div style="background-color: #f8f9fa; border-left: 4px solid #2D8CFF; padding: 15px; margin: 25px 0;">
                    <p style="margin: 5px 0;"><strong>Topic:</strong> ${topic}</p>
                    <p style="margin: 5px 0;"><strong>Start Time:</strong> ${new Date(startTime).toLocaleString()}</p>
                    <p style="margin: 5px 0;"><strong>Meeting ID:</strong> ${meetingId}</p>
                </div>

                <div style="text-align: center; margin: 35px 0;">
                    <a href="${joinUrl}" style="background-color: #2D8CFF; color: #ffffff; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(45, 140, 255, 0.2);">Join Meeting</a>
                </div>

                <p style="font-size: 14px; color: #666666;">If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="font-size: 12px; word-break: break-all; color: #2D8CFF;">${joinUrl}</p>
                
                <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 30px 0;">
                <p style="font-size: 12px; color: #999999; text-align: center;">Please make sure you have Zoom installed on your device before the meeting starts.</p>
            </div>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777777;">
                &copy; ${new Date().getFullYear()} lolfortnite650. All rights reserved.
            </div>
        </div>
    `;
    sendMail(email, `Meeting Invitation: ${topic}`, html);
};

export const sendStaffWelcomeEmail = (email: string, name: string, passwordPlain: string, restaurantName: string) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #333;">Welcome ${name}!</h2>
            <p style="color: #666;">You have been registered as a staff member for <strong>${restaurantName}</strong>.</p>
            <p style="color: #666;">Here are your account credentials to log in:</p>
            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>Password:</strong> ${passwordPlain}</p>
            </div>
            <p style="color: #666;">Please change your password after logging in for security reasons.</p>
        </div>
    `;
    sendMail(email, `Welcome to ${restaurantName} - Staff Account Details`, html);
};

export const sendStaffPasswordResetEmail = (email: string, name: string, passwordPlain: string, restaurantName: string) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #333;">Hello ${name},</h2>
            <p style="color: #666;">Your password has been reset by the restaurant owner${restaurantName ? ` of <strong>${restaurantName}</strong>` : ""}.</p>
            <p style="color: #666;">Here are your new account credentials to log in:</p>
            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>Password:</strong> ${passwordPlain}</p>
            </div>
            <p style="color: #666;">Please change your password after logging in for security reasons.</p>
        </div>
    `;
    sendMail(email, `Your Staff Account Password Has Been Reset`, html);
};

export const sendContactReplyEmail = (
    email: string,
    recipientName: string,
    subject: string,
    messageContent: string,
    replyMessage: string
) => {
    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
            <div style="text-align: center; border-bottom: 2px solid #edf2f7; padding-bottom: 15px; margin-bottom: 20px;">
                <h2 style="color: #2d3748; margin: 0; font-size: 22px; font-weight: 700;">Bazar Hisab</h2>
                <p style="color: #718096; margin: 5px 0 0 0; font-size: 14px;">Contact Support Response</p>
            </div>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.5; margin-top: 0;">Hello <strong>${recipientName}</strong>,</p>
            <p style="color: #4a5568; font-size: 15px; line-height: 1.5;">This is a reply to your message regarding: <strong>"${subject}"</strong>.</p>
            
            <div style="background-color: #f7fafc; border-left: 4px solid #e2e8f0; padding: 12px 16px; margin: 15px 0; color: #718096; font-style: italic; font-size: 14px;">
                "${messageContent}"
            </div>

            <div style="margin: 20px 0; padding: 18px; background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 4px; color: #1e293b; font-size: 15px; line-height: 1.6;">
                <h4 style="margin: 0 0 8px 0; color: #166534; font-weight: 600;">Support Reply:</h4>
                ${replyMessage.replace(/\n/g, "<br/>")}
            </div>
            
            <p style="color: #a0aec0; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #edf2f7; padding-top: 15px;">
                This email was sent by Bazar Hisab Support. Please do not reply directly to this email.
            </p>
        </div>
    `;
    sendMail(email, `Re: ${subject}`, html);
};

