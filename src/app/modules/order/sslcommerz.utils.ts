import axios from "axios";
import config from "../../config";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";

export interface ISSLCommerzPayload {
    total_amount: number;
    tran_id: string;
    cus_name: string;
    cus_email: string;
    cus_phone: string;
    cus_add1: string;
    cus_city: string;
    cus_postcode: string;
    cus_country: string;
    product_name: string;
    product_category: string;
}

export const initiateSSLCommerzPayment = async (payload: ISSLCommerzPayload) => {
    const store_id = config.ssl.store_id;
    const store_passwd = config.ssl.store_pass;
    const isSandbox = config.ssl.is_sandbox;

    if (!store_id || !store_passwd) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "SSLCommerz store configurations are missing");
    }

    const sslApiUrl = isSandbox
        ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
        : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

    const data = new URLSearchParams();
    data.append("store_id", store_id);
    data.append("store_passwd", store_passwd);
    data.append("total_amount", payload.total_amount.toString());
    data.append("currency", "BDT");
    data.append("tran_id", payload.tran_id);

    // Callbacks redirect back to backend callback routes
    const backendUrl = config.server_url;
    data.append("success_url", `${backendUrl}/api/v1/orders/payment/success/${payload.tran_id}`);
    data.append("fail_url", `${backendUrl}/api/v1/orders/payment/fail/${payload.tran_id}`);
    data.append("cancel_url", `${backendUrl}/api/v1/orders/payment/cancel/${payload.tran_id}`);
    data.append("ipn_url", `${backendUrl}/api/v1/orders/payment/ipn`);

    // Customer info
    data.append("cus_name", payload.cus_name);
    data.append("cus_email", payload.cus_email);
    data.append("cus_phone", payload.cus_phone);
    data.append("cus_add1", payload.cus_add1 || "N/A");
    data.append("cus_city", payload.cus_city || "Dhaka");
    data.append("cus_postcode", payload.cus_postcode || "1000");
    data.append("cus_country", payload.cus_country || "Bangladesh");

    // Product info
    data.append("shipping_method", "NO");
    data.append("num_of_item", "1");
    data.append("product_name", payload.product_name || "Order Purchase");
    data.append("product_category", payload.product_category || "General");
    data.append("product_profile", "general");

    try {
        const response = await axios.post(sslApiUrl, data, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        if (response.data && response.data.status === "SUCCESS") {
            return response.data.GatewayPageURL as string;
        } else {
            throw new ApiError(
                httpStatus.BAD_GATEWAY,
                `SSLCommerz initiation failed: ${response.data.failedreason || "Unknown reason"}`
            );
        }
    } catch (error: any) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(httpStatus.BAD_GATEWAY, `SSLCommerz gateway connection error: ${error.message}`);
    }
};
export const validateSSLCommerzPayment = async (val_id: string): Promise<boolean> => {
    const store_id = config.ssl.store_id;
    const store_passwd = config.ssl.store_pass;
    const isSandbox = config.ssl.is_sandbox;

    if (!val_id) return false;

    const validationUrl = isSandbox
        ? `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${store_id}&store_passwd=${store_passwd}&format=json`
        : `https://securepay.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${store_id}&store_passwd=${store_passwd}&format=json`;

    try {
        const response = await axios.get(validationUrl);
        return response.data && response.data.status === "VALID" || response.data.status === "VALIDATED";
    } catch (error) {
        return false;
    }
};
