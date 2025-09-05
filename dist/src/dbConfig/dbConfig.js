"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = connect;
const mongoose_1 = __importDefault(require("mongoose"));
async function connect() {
    if (mongoose_1.default.connection.readyState >= 1)
        return; // prevent multiple connects
    try {
        await mongoose_1.default.connect(process.env.MONGO_URL);
        const connection = mongoose_1.default.connection;
        connection.on("connected", () => {
            console.log("✅ Mongo Connected Successfully");
        });
        connection.on("error", (e) => {
            console.error("❌ MongoDB error:", e);
            process.exit(1);
        });
    }
    catch (e) {
        console.error("❌ Connection error:", e);
    }
}
