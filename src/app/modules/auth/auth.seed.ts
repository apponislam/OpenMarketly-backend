import bcrypt from "bcrypt";
import { UserModel } from "./auth.model";
import config from "../../config";

export const seedAdmin = async () => {
    try {
        const { initial_admin_name, initial_admin_email, initial_admin_password, initial_admin_phone } = config;

        const missingFields = [];
        if (!initial_admin_name) missingFields.push("INITIAL_ADMIN_NAME");
        if (!initial_admin_email) missingFields.push("INITIAL_ADMIN_EMAIL");
        if (!initial_admin_password) missingFields.push("INITIAL_ADMIN_PASSWORD");
        if (!initial_admin_phone) missingFields.push("INITIAL_ADMIN_PHONE");

        if (missingFields.length > 0) {
            console.log(`⚠️ Skipping initial admin seeding: missing environment variable(s) [${missingFields.join(", ")}]`);
            return;
        }

        const adminExists = await UserModel.findOne({
            role: { $in: ["SUPER_ADMIN", "ADMIN"] },
        });

        if (!adminExists) {
            console.log("📝 No admin found, creating initial admin...");

            const hashedPassword = await bcrypt.hash(initial_admin_password as string, Number(config.bcrypt_salt_rounds));

            const admin = {
                name: initial_admin_name,
                email: initial_admin_email,
                password: hashedPassword,
                role: "SUPER_ADMIN",
                phone: initial_admin_phone,
                isActive: true,
                isEmailVerified: true,
            };

            await UserModel.create(admin as any);

            console.log("✅ Super Admin created:", initial_admin_email);
        } else {
            console.log("✅ Admin already exists, skipping creation");
        }
    } catch (error) {
        console.error("❌ Error seeding admin:", error);
    }
};
