"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const node_1 = require("better-auth/node");
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./lib/auth");
const admin_js_1 = __importDefault(require("./route/admin.js"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(express_1.default.json());
app.use("/api/auth", (0, node_1.toNodeHandler)(auth_1.auth));
app.use("/api/admin", admin_js_1.default);
app.use((error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message || "Server Error";
    const errorCode = error.code || "Error_Code";
    res.status(status).json({ message, error: errorCode });
});
app.listen(8000, () => {
    console.log("Server running on http://localhost:8000");
});
//# sourceMappingURL=index.js.map
