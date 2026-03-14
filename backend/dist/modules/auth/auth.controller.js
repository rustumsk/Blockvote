"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const auth_service_1 = require("./auth.service");
exports.authController = {
    async register(req, res) {
        try {
            const { name, email, password, phone } = req.body;
            if (!name || !email || !password) {
                return res.status(400).json({ message: 'Name, email and password are required' });
            }
            const data = await auth_service_1.authService.register({ name, email, password, phone });
            return res.status(201).json(data);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Registration failed';
            const status = message === 'Email already registered' ? 409 : 400;
            return res.status(status).json({ message });
        }
    },
    async verifyEmail(req, res) {
        try {
            const token = req.query.token;
            if (!token)
                return res.status(400).json({ message: 'Token is required' });
            const data = await auth_service_1.authService.verifyEmail(token);
            return res.json(data);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Verification failed';
            return res.status(400).json({ message });
        }
    },
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }
            const data = await auth_service_1.authService.login(email, password);
            return res.json(data);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed';
            const status = message.includes('verify your email') ? 403 : 401;
            return res.status(status).json({ message });
        }
    },
    async me(req, res) {
        try {
            if (!req.user?.id)
                return res.status(401).json({ message: 'Unauthorized' });
            const user = await auth_service_1.authService.me(req.user.id);
            return res.json(user);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to get user';
            return res.status(500).json({ message });
        }
    },
    async updateWallet(req, res) {
        try {
            if (!req.user?.id)
                return res.status(401).json({ message: 'Unauthorized' });
            const { walletAddress } = req.body;
            if (!walletAddress || typeof walletAddress !== 'string') {
                return res.status(400).json({ message: 'walletAddress is required' });
            }
            const user = await auth_service_1.authService.updateWallet(req.user.id, walletAddress.trim());
            return res.json(user);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update wallet';
            return res.status(500).json({ message });
        }
    },
};
//# sourceMappingURL=auth.controller.js.map