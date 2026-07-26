import "./firebase";
import { getMessaging } from "firebase-admin/messaging";
import { notificationServices } from "../app/modules/notification/notification.services";
import { UserModel } from "../app/modules/auth/auth.model";
import { NotificationType } from "../app/modules/notification/notification.interface";

/**
 * Send push notification to multiple tokens AND save to database
 */
const sendPushNotification = async (tokens: string[], title: string, body: string, userId?: string, type?: string, data?: Record<string, string>) => {
    // Send push notification via Firebase
    if (tokens && tokens.length > 0) {
        const message = {
            notification: {
                title,
                body,
            },
            data: data || {},
            apns: {
                payload: {
                    aps: {
                        sound: "default",
                        badge: 1,
                    },
                },
            },
            tokens: tokens,
        };

        try {
            const response = await getMessaging().sendEachForMulticast(message);
            console.log(`[NOTIFICATION] Success: ${response.successCount} sent, ${response.failureCount} failed.`);

            // Clean up failed tokens if userId is provided
            if (response.failureCount > 0 && userId) {
                const failedTokens: string[] = [];
                response.responses.forEach((resp: any, idx: number) => {
                    if (!resp.success) {
                        console.log(`[NOTIFICATION] Error for token ${tokens[idx]}:`, resp.error);
                        failedTokens.push(tokens[idx]);
                    }
                });

                // Remove failed tokens from user
                if (failedTokens.length > 0) {
                    await UserModel.findByIdAndUpdate(userId, { $pull: { fcmTokens: { $in: failedTokens } } });
                    console.log(`[NOTIFICATION] Removed ${failedTokens.length} failed tokens for user ${userId}`);
                }
            }
        } catch (error) {
            console.error("[NOTIFICATION] Error sending push notifications:", error);
        }
    }

    // Save notification to database if userId and type are provided
    if (userId && type) {
        try {
            await notificationServices.createNotification(
                userId,
                title,
                body,
                type as NotificationType
            );
            console.log(`[NOTIFICATION] Saved to database for user ${userId}`);
        } catch (error) {
            console.error("[NOTIFICATION] Error saving to database:", error);
        }
    }
};

export const NotificationUtils = {
    sendPushNotification,
};
