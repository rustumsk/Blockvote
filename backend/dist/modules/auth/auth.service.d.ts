export declare const authService: {
    register(data: {
        name: string;
        email: string;
        password: string;
        phone?: string;
    }): Promise<{
        message: string;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    login(email: string, password: string): Promise<{
        token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.Status;
            walletAddress: string | null;
        };
    }>;
    me(userId: string): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.Role;
        name: string;
        email: string;
        walletAddress: string | null;
        phone: string | null;
        status: import(".prisma/client").$Enums.Status;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateWallet(userId: string, walletAddress: string): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.Role;
        name: string;
        email: string;
        walletAddress: string | null;
        phone: string | null;
        status: import(".prisma/client").$Enums.Status;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
};
//# sourceMappingURL=auth.service.d.ts.map