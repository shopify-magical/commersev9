/**
 * Unified Gateway - Single Entry Point for All Services
 * Combines Agentic Engine, Bakery Frontend, Admin Dashboard, Payment, Line Integration
 * Architecture inspired by Thai Rubber ERP unified system
 */
interface Env {
    bizcommerz_db: D1Database;
    ENGINE_NAME?: string;
    LOG_LEVEL?: string;
    ENABLE_LEARNING?: string;
}
declare const _default: {
    fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>;
};
export default _default;
