import type { Request, Response } from "express";
type Params = {
    reference: string;
};
declare class PaymentController {
    static paystackWebhook(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static initialize(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getStatus(req: Request<Params>, res: Response): Promise<Response<any, Record<string, any>>>;
    static verifyPayment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export default PaymentController;
//# sourceMappingURL=payments.d.ts.map