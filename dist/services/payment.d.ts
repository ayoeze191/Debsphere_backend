declare class PaymentService {
    static handleWebhook(event: any): Promise<void>;
    static initializePayment(userId: string, slug: string, fullName: string, email: string, phoneNumber: string): Promise<{
        authorizationUrl: any;
        accessCode: any;
        reference: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    static verifyPayment(reference: string): Promise<any>;
}
export default PaymentService;
//# sourceMappingURL=payment.d.ts.map