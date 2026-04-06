/**
 * Cloudflare Workers entry point for Agentic Engine
 * Adapts the Node.js server for Edge runtime
 */
export interface Env {
    QUOTES_KV: KVNamespace;
    ORDERS_KV: KVNamespace;
    ENGINE_STATE: DurableObjectNamespace;
    API_TOKEN?: string;
    ENGINE_NAME?: string;
    LOG_LEVEL?: string;
    ENABLE_LEARNING?: string;
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
