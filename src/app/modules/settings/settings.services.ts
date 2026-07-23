import { ISiteSettings } from "./settings.interface";
import { SettingsModel } from "./settings.model";

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

const updateSettings = async (data: Partial<ISiteSettings>) => {
    let settings = await SettingsModel.findOne();

    if (!settings) {
        settings = await SettingsModel.create(data);
        return settings;
    }

    const updatedSettings = await SettingsModel.findByIdAndUpdate(
        settings._id,
        { $set: data },
        { new: true, runValidators: true }
    );

    return updatedSettings;
};

export const settingsServices = {
    getSettings,
    updateSettings,
};
