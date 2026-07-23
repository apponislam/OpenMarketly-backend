import { ISiteSettings } from "./settings.interface";
import { SettingsModel } from "./settings.model";
import { activityServices } from "../activity/activity.services";
import { ActivityType } from "../activity/activity.interface";

/**
 * Site settings is a singleton — only one document exists.
 * getSettings creates it with defaults if it doesn't exist yet.
 */
const getSettings = async () => {
    let settings = await SettingsModel.findOne();

    if (!settings) {
        settings = await SettingsModel.create({});
    }

    return settings;
};

const updateSettings = async (data: Partial<ISiteSettings>, userId: string) => {
    let settings = await SettingsModel.findOne();

    if (!settings) {
        settings = await SettingsModel.create(data);
        
        // Log settings update
        activityServices.logActivity(
            userId,
            ActivityType.SETTINGS_UPDATE,
            "Initialized and updated site configuration settings"
        );

        return settings;
    }

    const updatedSettings = await SettingsModel.findByIdAndUpdate(
        settings._id,
        { $set: data },
        { new: true, runValidators: true }
    );

    // Log settings update
    activityServices.logActivity(
        userId,
        ActivityType.SETTINGS_UPDATE,
        "Updated site configuration settings"
    );

    return updatedSettings;
};

export const settingsServices = {
    getSettings,
    updateSettings,
};
