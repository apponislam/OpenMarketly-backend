import { SettingsModel } from "./settings.model";

const seedSettings = async () => {
    try {
        const count = await SettingsModel.countDocuments();
        if (count === 0) {
            await SettingsModel.create({
                contactEmail: "support@openmarketly.com",
                contactPhone: "+8801700000000",
                contactAddress: "Dhaka, Bangladesh",
                socialLinks: {
                    facebook: "https://facebook.com/openmarketly",
                    twitter: "https://twitter.com/openmarketly",
                    instagram: "https://instagram.com/openmarketly",
                    youtube: "https://youtube.com/openmarketly",
                    linkedin: "https://linkedin.com/company/openmarketly",
                    tiktok: "https://tiktok.com/@openmarketly",
                },
                isMaintenanceMode: false,
                maintenanceMessage: "We are currently under maintenance. Please check back later.",
                allowGuestCheckout: false,
                allowSellerRegistration: true,
                autoApproveProducts: true,
                sellerCommissionRate: 10,
            });
            console.log("🟢 Site Settings successfully seeded.");
        }
    } catch (error) {
        console.error("🔴 Error seeding Site Settings:", error);
    }
};

export default seedSettings;
