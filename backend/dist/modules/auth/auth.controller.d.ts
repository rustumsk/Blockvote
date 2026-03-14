import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
export declare const authController: {
    register(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    verifyEmail(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    login(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    me(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    updateWallet(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=auth.controller.d.ts.map