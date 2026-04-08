/**
 * Sweet Layers Bakery Assistant Agent
 * Built with Cloudflare Agents SDK
 */
import { Agent } from 'agents';
import type { Env } from '../worker.js';
export type BakeryState = {
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
