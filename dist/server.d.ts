export interface ServerConfig {
    port: number;
    host: string;
    cors?: {
        enabled: boolean;
        origin: string | string[];
        credentials: boolean;
    };
    engineConfig: {
        name: string;
        tickIntervalMs: number;
        logLevel: 'debug' | 'info' | 'warn' | 'error';
        enableLearning: boolean;
        enableSelfImprovement: boolean;
    };
}
export declare class AgenticServer {
    private server;
    private engine;
    private config;
    private startTime;
    private publicDir;
    private orders;
    private quotes;
    constructor(config?: Partial<ServerConfig>);
    private setupEventHandlers;
    private setCORSHeaders;
    private setupGracefulShutdown;
    private getRecommendations;
    private searchProducts;
    private getInventory;
    private getChatCommands;
    private decomposeGoal;
    private executeWorkerTask;
    private calculateSimilarity;
    private extractCustomers;
    private findSimilarCustomers;
    private handleRequest;
    start(): Promise<void>;
    stop(): Promise<void>;
}
