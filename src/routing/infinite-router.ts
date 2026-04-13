/**
 * Infinite Unix Routing Agentic Gateway
 * 
 * A self-organizing, AI-powered routing system inspired by Unix philosophy:
 * - Hierarchical path structure (like Unix filesystem)
 * - Composable middleware pipelines (like Unix pipes)
 * - Dynamic route registration (like Unix PATH)
 * - Agentic decision-making (AI-powered routing)
 * - Infinite scalability (self-organizing routes)
 */

export interface RouteConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  handler: RouteHandler;
  middleware?: Middleware[];
  meta?: RouteMeta;
}

export interface RouteMeta {
  category: 'bin' | 'usr' | 'etc' | 'var' | 'tmp' | 'opt' | 'home';
  version?: string;
  deprecated?: boolean;
  rateLimit?: number;
  authRequired?: boolean;
  description?: string;
  tags?: string[];
}

export type RouteHandler = (
  request: Request,
  context: RouteContext
) => Promise<Response> | Response;

export interface RouteContext {
  params: Record<string, string>;
  query: URLSearchParams;
  headers: Headers;
  env: any;
  engine: any;
  state: Map<string, any>;
}

export type Middleware = (
  request: Request,
  context: RouteContext,
  next: () => Promise<Response>
) => Promise<Response> | Response;

export interface RouteMatch {
  route: RouteConfig;
  params: Record<string, string>;
  score: number;
}

/**
 * Unix-style hierarchical router with agentic capabilities
 */
export class InfiniteUnixRouter {
  private routes: Map<string, RouteConfig[]> = new Map();
  private middleware: Middleware[] = [];
  private routeTree: RouteNode = new RouteNode();
  private agenticDecisionEngine: AgenticRouter | null = null;

  constructor() {
    this.initializeUnixPaths();
  }

  /**
   * Initialize Unix-style path categories
   */
  private initializeUnixPaths(): void {
    // /bin - Essential commands (core API endpoints)
    this.registerCategory('bin', 'Core system endpoints');
    
    // /usr/bin - User commands (extended API endpoints)
    this.registerCategory('usr/bin', 'Extended endpoints');
    
    // /etc - Configuration (admin endpoints)
    this.registerCategory('etc', 'Configuration and admin');
    
    // /var - Variable data (dynamic content)
    this.registerCategory('var', 'Dynamic data endpoints');
    
    // /tmp - Temporary (ephemeral endpoints)
    this.registerCategory('tmp', 'Ephemeral endpoints');
    
    // /opt - Optional software (third-party integrations)
    this.registerCategory('opt', 'Third-party integrations');
    
    // /home - User directories (tenant-specific endpoints)
    this.registerCategory('home', 'Tenant-specific endpoints');
  }

  private registerCategory(path: string, description: string): void {
    // Placeholder for category registration
    // In production, this would create metadata and documentation
  }

  /**
   * Register a new route with Unix-style path
   */
  register(config: RouteConfig): void {
    const key = `${config.method}:${config.path}`;
    
    if (!this.routes.has(key)) {
      this.routes.set(key, []);
    }
    
    this.routes.get(key)!.push(config);
    
    // Add to route tree for efficient matching
    this.routeTree.insert(config.path, config);
    
    // Notify agentic engine of new route
    if (this.agenticDecisionEngine) {
      this.agenticDecisionEngine.onRouteRegistered(config);
    }
  }

  /**
   * Register middleware for all routes
   */
  use(middleware: Middleware): void {
    this.middleware.push(middleware);
  }

  /**
   * Set agentic decision engine
   */
  setAgenticEngine(engine: AgenticRouter): void {
    this.agenticDecisionEngine = engine;
  }

  /**
   * Match request to routes using Unix-style path matching
   */
  async match(request: Request): Promise<RouteMatch | null> {
    const url = new URL(request.url);
    const method = request.method as any;
    const path = url.pathname;

    // Exact match first
    const exactKey = `${method}:${path}`;
    if (this.routes.has(exactKey)) {
      const routes = this.routes.get(exactKey)!;
      return {
        route: routes[0],
        params: {},
        score: 1.0
      };
    }

    // Pattern matching with route tree
    const matches = this.routeTree.match(path, method);
    if (matches.length > 0) {
      return matches[0];
    }

    // Agentic fallback - let AI decide the best route
    if (this.agenticDecisionEngine) {
      const agenticMatch = await this.agenticDecisionEngine.decideRoute(request);
      if (agenticMatch) {
        return agenticMatch;
      }
    }

    return null;
  }

  /**
   * Handle incoming request with middleware pipeline
   */
  async handle(request: Request, env: any, engine: any): Promise<Response> {
    const url = new URL(request.url);
    const context: RouteContext = {
      params: {},
      query: url.searchParams,
      headers: request.headers,
      env,
      engine,
      state: new Map()
    };

    // Build middleware pipeline
    const pipeline = [...this.middleware];

    // Find matching route
    const match = await this.match(request);
    
    if (!match) {
      return new Response('Route not found', { status: 404 });
    }

    // Add route-specific middleware
    if (match.route.middleware) {
      pipeline.push(...match.route.middleware);
    }

    // Execute pipeline
    let index = 0;
    const executeNext = async (): Promise<Response> => {
      if (index >= pipeline.length) {
        // Execute route handler
        context.params = match.params;
        return match.route.handler(request, context);
      }

      const middleware = pipeline[index++];
      return middleware(request, context, executeNext);
    };

    return executeNext();
  }

  /**
   * Get all registered routes
   */
  getRoutes(): RouteConfig[] {
    const allRoutes: RouteConfig[] = [];
    for (const routes of this.routes.values()) {
      allRoutes.push(...routes);
    }
    return allRoutes;
  }

  /**
   * Get routes by Unix category
   */
  getRoutesByCategory(category: string): RouteConfig[] {
    return this.getRoutes().filter(route => 
      route.meta?.category === category
    );
  }

  /**
   * Export route tree as Unix-style tree structure
   */
  exportTree(): string {
    return this.routeTree.toString();
  }
}

/**
 * Route tree node for efficient path matching
 */
class RouteNode {
  children: Map<string, RouteNode> = new Map();
  routes: RouteConfig[] = [];
  paramChild: RouteNode | null = null;
  paramName: string | null = null;

  insert(path: string, route: RouteConfig): void {
    const segments = path.split('/').filter(Boolean);
    let node = this;

    for (const segment of segments) {
      if (segment.startsWith(':')) {
        // Parameter segment
        const paramName = segment.slice(1);
        if (!node.paramChild) {
          node.paramChild = new RouteNode();
          node.paramName = paramName;
        }
        node = node.paramChild;
      } else {
        // Static segment
        if (!node.children.has(segment)) {
          node.children.set(segment, new RouteNode());
        }
        node = node.children.get(segment)!;
      }
    }

    node.routes.push(route);
  }

  match(path: string, method: string): RouteMatch[] {
    const segments = path.split('/').filter(Boolean);
    const matches: RouteMatch[] = [];
    this.matchRecursive(segments, method, {}, 0, matches);
    return matches.sort((a, b) => b.score - a.score);
  }

  private matchRecursive(
    segments: string[],
    method: string,
    params: Record<string, string>,
    depth: number,
    matches: RouteMatch[]
  ): void {
    if (depth === segments.length) {
      // Found matching node
      for (const route of this.routes) {
        if (route.method === method) {
          matches.push({
            route,
            params: { ...params },
            score: 1.0 - (Object.keys(params).length * 0.1)
          });
        }
      }
      return;
    }

    const segment = segments[depth];

    // Try static match
    if (this.children.has(segment)) {
      this.children.get(segment)!.matchRecursive(
        segments,
        method,
        params,
        depth + 1,
        matches
      );
    }

    // Try parameter match
    if (this.paramChild) {
      const newParams = { ...params };
      if (this.paramName) {
        newParams[this.paramName] = segment;
      }
      this.paramChild.matchRecursive(
        segments,
        method,
        newParams,
        depth + 1,
        matches
      );
    }
  }

  toString(indent = 0): string {
    const prefix = '  '.repeat(indent);
    let result = '';
    
    for (const [segment, child] of this.children) {
      result += `${prefix}${segment}/\n`;
      result += child.toString(indent + 1);
    }
    
    if (this.paramChild) {
      result += `${prefix}:${this.paramName}/\n`;
      result += this.paramChild.toString(indent + 1);
    }
    
    return result;
  }
}

/**
 * Agentic router decision engine
 * Uses AI to make intelligent routing decisions
 */
export class AgenticRouter {
  private routePatterns: Map<string, number> = new Map();
  private performanceMetrics: Map<string, number[]> = new Map();

  onRouteRegistered(route: RouteConfig): void {
    // Learn from new route registration
    const pattern = this.extractPattern(route.path);
    this.routePatterns.set(pattern, (this.routePatterns.get(pattern) || 0) + 1);
  }

  async decideRoute(request: Request): Promise<RouteMatch | null> {
    // Use AI to determine best route
    // This would integrate with the agentic engine
    return null;
  }

  private extractPattern(path: string): string {
    // Extract routing pattern for learning
    return path.replace(/:[^/]+/g, ':param');
  }

  recordPerformance(routeKey: string, latency: number): void {
    if (!this.performanceMetrics.has(routeKey)) {
      this.performanceMetrics.set(routeKey, []);
    }
    this.performanceMetrics.get(routeKey)!.push(latency);
    
    // Keep only last 100 measurements
    const metrics = this.performanceMetrics.get(routeKey)!;
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  getAveragePerformance(routeKey: string): number {
    const metrics = this.performanceMetrics.get(routeKey);
    if (!metrics || metrics.length === 0) return 0;
    
    const sum = metrics.reduce((a, b) => a + b, 0);
    return sum / metrics.length;
  }
}

/**
 * Common middleware for Unix-style routing
 */
export const UnixMiddleware = {
  // Logging middleware
  logger: (request: Request, context: RouteContext, next: () => Promise<Response>) => {
    const start = Date.now();
    console.log(`[${new Date().toISOString()}] ${request.method} ${new URL(request.url).pathname}`);
    return next().then(response => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${request.method} ${new URL(request.url).pathname} - ${response.status} (${duration}ms)`);
      return response;
    });
  },

  // CORS middleware
  cors: (origin: string = '*') => {
    return (request: Request, context: RouteContext, next: () => Promise<Response>) => {
      return next().then(response => {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return response;
      });
    };
  },

  // Rate limiting middleware
  rateLimit: (maxRequests: number, windowMs: number) => {
    const requests = new Map<string, number[]>();
    
    return async (request: Request, context: RouteContext, next: () => Promise<Response>) => {
      const clientId = context.headers.get('CF-Connecting-IP') || 'unknown';
      const now = Date.now();
      
      if (!requests.has(clientId)) {
        requests.set(clientId, []);
      }
      
      const clientRequests = requests.get(clientId)!;
      // Remove old requests outside window
      const validRequests = clientRequests.filter(t => now - t < windowMs);
      
      if (validRequests.length >= maxRequests) {
        return new Response('Rate limit exceeded', { status: 429 });
      }
      
      validRequests.push(now);
      requests.set(clientId, validRequests);
      
      return next();
    };
  },

  // Authentication middleware
  auth: (required: boolean = true) => {
    return async (request: Request, context: RouteContext, next: () => Promise<Response>) => {
      const authHeader = context.headers.get('Authorization');
      
      if (required && !authHeader) {
        return new Response('Authentication required', { status: 401 });
      }
      
      // Add user info to context if authenticated
      if (authHeader) {
        // Verify token and add user context
        // context.state.set('user', verifiedUser);
      }
      
      return next();
    };
  }
};

// Export singleton instance
export const router = new InfiniteUnixRouter();
