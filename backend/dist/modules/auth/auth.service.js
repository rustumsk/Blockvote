"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../../config/db"));
const generateToken_1 = require("../../utils/generateToken");
const sendEmail_1 = require("../../utils/sendEmail");
const SALT_ROUNDS = 10;
exports.authService = {
    async register(data) {
        const existing = await db_1.default.user.findUnique({ where: { email: data.email } });
        if (existing)
            throw new Error('Email already registered');
        const hashedPassword = await bcryptjs_1.default.hash(data.password, SALT_ROUNDS);
        const verifyToken = crypto.randomUUID();
        await db_1.default.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                phone: data.phone ?? null,
                role: 'VOTER',
                status: 'PENDING',
                isVerified: false,
                verifyToken,
            },
        });
        await (0, sendEmail_1.sendVerificationEmail)(data.email, verifyToken);
        return { message: 'Verification email sent' };
    },
    async verifyEmail(token) {
        const user = await db_1.default.user.findFirst({ where: { verifyToken: token } });
        if (!user)
            throw new Error('Invalid or expired verification token');
        await db_1.default.user.update({
            where: { id: user.id },
            data: { isVerified: true, verifyToken: null },
        });
        return { message: 'Email verified successfully' };
    },
    async login(email, password) {
        const user = await db_1.default.user.findUnique({ where: { email } });
        if (!user)
            throw new Error('Invalid email or password');
        const match = await bcryptjs_1.default.compare(password, user.password);
        if (!match)
            throw new Error('Invalid email or password');
        if (!user.isVerified)
            throw new Error('Please verify your email before logging in');
        const token = (0, generateToken_1.generateToken)(user.id, user.role);
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                walletAddress: user.walletAddress,
            },
        };
    },
    async me(userId) {
        const user = await db_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                walletAddress: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user)
            throw new Error('User not found');
        return user;
    },
    async updateWallet(userId, walletAddress) {
        const user = await db_1.default.user.update({
            where: { id: userId },
            data: { walletAddress },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                walletAddress: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return user;
    },
};
//# sourceMappingURL=auth.service.js.map