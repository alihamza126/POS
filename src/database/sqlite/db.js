"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const better_sqlite3_1 = require("drizzle-orm/better-sqlite3");
const better_sqlite3_2 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const authSchema = __importStar(require("../schema/auth"));
const inventorySchema = __importStar(require("../schema/inventory"));
const salesSchema = __importStar(require("../schema/sales"));
const auditSchema = __importStar(require("../schema/audit"));
const syncSchema = __importStar(require("../schema/sync"));
const customersSchema = __importStar(require("../schema/customers"));
const categoriesSchema = __importStar(require("../schema/categories"));
const suppliersSchema = __importStar(require("../schema/suppliers"));
const schema = {
    ...authSchema,
    ...inventorySchema,
    ...salesSchema,
    ...auditSchema,
    ...syncSchema,
    ...customersSchema,
    ...categoriesSchema,
    ...suppliersSchema,
};
// Ensure this runs only in the main process or during testing
const dbPath = process.env.DATABASE_URL ||
    (electron_1.app ? path_1.default.join(electron_1.app.getPath('userData'), 'pos-v1.db') : path_1.default.join(process.cwd(), 'pos-v1.db'));
const sqlite = new better_sqlite3_2.default(dbPath);
// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');
exports.db = (0, better_sqlite3_1.drizzle)(sqlite, { schema });
