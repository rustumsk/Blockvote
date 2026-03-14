"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const express_1 = require("express");
const errorHandler = (err, req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || 'Internal server error' });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map