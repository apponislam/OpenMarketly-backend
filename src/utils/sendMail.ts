import config from "../app/config";
import { sendNodemailerMail } from "./nodemailer";
import { sendEmailWithResend } from "./resend";

export const sendMail = (to: string | string[], subject: string, html: string, from?: string) => {
    if (config.mail.driver === "RESEND") {
        sendEmailWithResend({ to, subject, html, from }).catch((error) => {
            console.error("Resend Email error:", error);
        });
    } else {
        sendNodemailerMail(to, subject, html, from);
    }
};
