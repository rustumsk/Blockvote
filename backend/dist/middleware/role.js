"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireApprovedVoter = exports.requireAdmin = void 0;
const express_1 = require("express");
const auth_1 = require("./auth");
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireApprovedVoter = (req, res, next) => {
    if (req.user?.role !== 'VOTER') {
        return res.status(403).json({ message: 'Voter access required' });
    }
    next();
};
exports.requireApprovedVoter = requireApprovedVoter;
//# sourceMappingURL=role.js.map