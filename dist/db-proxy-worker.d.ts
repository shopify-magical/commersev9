/**
 * CockroachDB Proxy Worker
 * Provides HTTP API access to CockroachDB from other Cloudflare Workers
 */
export interface Env {
    DATABASE_URL: string;
}
declare const _default: {
    fetch(request: Request, env: Env): Promise<Response>;
};
export default _default;
