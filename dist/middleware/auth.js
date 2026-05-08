"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.AuthMiddleware = void 0;
const auth_1 = require("../lib/auth");
const AuthMiddleware = async (req, res, next) => {
    const session = await auth_1.auth.api.getSession({
        headers: req.headers
    });
    if (!session) {
        return res.status(401).json({ message: "Please login" });
    }
    req.user = session.user;
    req.session = session.session;
    next();
};
exports.AuthMiddleware = AuthMiddleware;
const isAdmin = (req, res, next) => {
    if (req.user && req.user?.role === "ADMIN") {
        next();
    }
    else {
        return res.status(403).json({ message: "Forbidden" });
    }
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=auth.js.map