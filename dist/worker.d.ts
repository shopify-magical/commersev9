/**
 * Sweet Layers Agentic Engine - Cloudflare Worker
 * Unified API Gateway for all services
 */
import { Agent } from 'agents';
export interface Env {
    bizcommerz_db: D1Database;
    CONFIG: KVNamespace;
    SESSIONS: KVNamespace;
    ENGINE_STATE: DurableObjectNamespace;
    ENGINE_NAME: string;
    LOG_LEVEL: string;
    ENABLE_LEARNING: string;
    ASSETS: Fetcher;
}
declare const _default: {
    fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>;
};
export default _default;
export declare class EngineState {
    private state;
    private env;
    constructor(state: DurableObjectState, env: Env);
    fetch(request: Request): Promise<Response>;
}
type BakeryState = {
    chatHistory: Array<{
        role: string;
        content: string;
        timestamp: number;
    }>;
    customerPreferences: {
        favoriteCategories: string[];
        lastViewedProducts: string[];
        orderCount: number;
    };
    currentSession: {
        sessionId: string;
        startedAt: number;
        lastActivity: number;
    };
};
export declare class BakeryAssistantAgent extends Agent<Env, BakeryState> {
    initialState: BakeryState;
    private productCatalog;
    initializeSession(sessionId: string): Promise<{
        success: boolean;
        sessionId: string;
    }>;
    sendMessage(message: string): Promise<{
        response: string;
        products: any[];
        timestamp: number;
    }>;
    searchProducts(query: string): Promise<{
        products: any[];
    }>;
    getChatHistory(): Promise<{
        role: string;
        content: string;
        timestamp: number;
    }[]>;
    getCustomerPreferences(): Promise<{
        favoriteCategories: string[];
        lastViewedProducts: string[];
        orderCount: number;
    }>;
    clearSession(): Promise<{
        success: boolean;
    }>;
    private generateResponse;
    private getRelevantProducts;
    private updatePreferences;
}
