import { Resend } from "resend";
import config from "../app/config";

let resendClient: Resend | null = null;

export const getResendClient = (): Resend => {
    if (!resendClient) {
        const apiKey = config.mail.resend_api_key;
        if (!apiKey) {
            throw new Error("Missing RESEND_API_KEY in environment variables.");
        }
        resendClient = new Resend(apiKey);
    }
    return resendClient;
};

export interface ISendEmailPayload {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    cc?: string | string[];
    bcc?: string | string[];
    replyTo?: string | string[];
    text?: string;
}

/**
 * Send email via Resend API
 */
export const sendEmailWithResend = async (payload: ISendEmailPayload) => {
    const { to, subject, html, from, cc, bcc, replyTo, text } = payload;

    try {
        const sender = from || config.mail.from_email || "";
        const resend = getResendClient();
        const data = await resend.emails.send({
            from: sender,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
            ...(cc && { cc: Array.isArray(cc) ? cc : [cc] }),
            ...(bcc && { bcc: Array.isArray(bcc) ? bcc : [bcc] }),
            ...(replyTo && { replyTo }),
            ...(text && { text }),
        });

        return data;
    } catch (error) {
        console.error("Resend Email error:", error);
        throw error;
    }
};
