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

export interface ISSLCommerzValidationResponse {
    isValid: boolean;
    bankTranId?: string;
    cardType?: string;
    cardBrand?: string;
    cardIssuer?: string;
    amount?: number;
    paymentDate?: string;
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

export const validateSSLCommerzPayment = async (val_id: string): Promise<ISSLCommerzValidationResponse> => {
    const store_id = config.ssl.store_id;
    const store_passwd = config.ssl.store_pass;
    const isSandbox = config.ssl.is_sandbox;

    if (!val_id) {
        return { isValid: false };
    }

    const validationUrl = isSandbox
        ? `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${store_id}&store_passwd=${store_passwd}&format=json`
        : `https://securepay.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${store_id}&store_passwd=${store_passwd}&format=json`;

    try {
        const response = await axios.get(validationUrl);
        const data = response.data;

        if (data && (data.status === "VALID" || data.status === "VALIDATED")) {
            return {
                isValid: true,
                bankTranId: data.bank_tran_id,
                cardType: data.card_type,
                cardBrand: data.card_brand,
                cardIssuer: data.card_issuer,
                amount: Number(data.amount),
                paymentDate: data.tran_date,
            };
        }

        return { isValid: false };
    } catch (error) {
        return { isValid: false };
    }
};

export interface ISSLCommerzRefundResponse {
    success: boolean;
    refundTxnId?: string;
    message?: string;
}

export const refundSSLCommerzPayment = async (
    bankTranId: string,
    refundAmount: number,
    remarks: string
): Promise<ISSLCommerzRefundResponse> => {
    const store_id = config.ssl.store_id;
    const store_passwd = config.ssl.store_pass;
    const isSandbox = config.ssl.is_sandbox;

    if (!store_id || !store_passwd) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "SSLCommerz store configurations are missing");
    }

    // Refund query endpoint is validator endpoint (merchantTransIDvalidationAPI.php is also used for refund request)
    const refundUrl = isSandbox
        ? "https://sandbox.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php"
        : "https://securepay.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php";

    const params = new URLSearchParams();
    params.append("store_id", store_id);
    params.append("store_passwd", store_passwd);
    params.append("bank_tran_id", bankTranId);
    params.append("refund_amount", refundAmount.toString());
    params.append("refund_remarks", remarks || "Customer Refund Request");
    params.append("v", "1");
    params.append("format", "json");

    try {
        const response = await axios.post(refundUrl, params, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        const data = response.data;
        // Check SSLCommerz Refund API Response status
        if (data && data.status === "success") {
            return {
                success: true,
                refundTxnId: data.ref_id,
                message: data.errorreason || "Refund requested successfully",
            };
        } else {
            return {
                success: false,
                message: data.errorreason || data.failedreason || "Refund request failed",
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "SSLCommerz connection error",
        };
    }
};

export interface ISSLCommerzPayoutPayload {
    amount: number;
    tran_id: string;
    payment_mode: "BANK" | "BKASH" | "NAGAD" | "ROCKET";
    receiver_name: string;
    receiver_account: string; // Phone number for MFS, account number for Bank
    bank_name?: string;
    branch_name?: string;
    routing_number?: string;
}

export interface ISSLCommerzPayoutResponse {
    success: boolean;
    payoutRefId?: string;
    message?: string;
}

export const initiateSSLCommerzPayout = async (payload: ISSLCommerzPayoutPayload): Promise<ISSLCommerzPayoutResponse> => {
    const store_id = config.ssl.store_id;
    const store_passwd = config.ssl.store_pass;
    const isSandbox = config.ssl.is_sandbox;

    if (!store_id || !store_passwd) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "SSLCommerz store configurations are missing");
    }

    const disburseUrl = isSandbox
        ? "https://sandbox.sslcommerz.com/api/v1/disburse"
        : "https://securepay.sslcommerz.com/api/v1/disburse";

    const params = new URLSearchParams();
    params.append("store_id", store_id);
    params.append("store_passwd", store_passwd);
    params.append("amount", payload.amount.toString());
    params.append("currency", "BDT");
    params.append("merchant_trans_id", payload.tran_id);
    params.append("payment_mode", payload.payment_mode.toLowerCase());
    params.append("beneficiary_name", payload.receiver_name || "Seller Withdrawal");
    params.append("beneficiary_account", payload.receiver_account);
    params.append("beneficiary_mobile", payload.receiver_account);

    if (payload.payment_mode === "BANK") {
        if (payload.bank_name) params.append("bank_name", payload.bank_name);
        if (payload.branch_name) params.append("branch_name", payload.branch_name);
        if (payload.routing_number) params.append("routing_number", payload.routing_number);
    }

    try {
        const response = await axios.post(disburseUrl, params, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        const data = response.data;
        if (data && (data.status === "success" || data.status === "SUCCESS")) {
            return {
                success: true,
                payoutRefId: data.ref_id || data.tran_id,
                message: data.message || "Payout requested successfully",
            };
        } else {
            return {
                success: false,
                message: data.errorreason || data.failedreason || data.message || "Disbursement failed by gateway",
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "SSLCommerz gateway connection error during payout",
        };
    }
};
