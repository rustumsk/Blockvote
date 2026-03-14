"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const auth_controller_1 = require("./auth.controller");
const router = (0, express_1.Router)();
router.post('/register', auth_controller_1.authController.register.bind(auth_controller_1.authController));
router.get('/verify-email', auth_controller_1.authController.verifyEmail.bind(auth_controller_1.authController));
router.post('/login', auth_controller_1.authController.login.bind(auth_controller_1.authController));
router.get('/me', auth_1.authenticate, auth_controller_1.authController.me.bind(auth_controller_1.authController));
router.patch('/wallet', auth_1.authenticate, auth_controller_1.authController.updateWallet.bind(auth_controller_1.authController));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map