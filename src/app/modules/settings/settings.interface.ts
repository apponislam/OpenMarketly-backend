export interface ISocialLinks {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    tiktok?: string;
}


export interface ISiteSettings {
    // Contact
    contactEmail?: string;
    contactPhone?: string;
    contactAddress?: string;

    // Social
    socialLinks?: ISocialLinks;

    // Feature Flags
    isMaintenanceMode: boolean;
    maintenanceMessage?: string;
    allowGuestCheckout: boolean;
    allowSellerRegistration: boolean;
    autoApproveProducts: boolean;
    sellerCommissionRate?: number; // percentage (e.g. 10 for 10%)

    updatedAt?: Date;
}
