/**
 * Unix-Style Route Definitions
 * 
 * Following Unix filesystem philosophy:
 * /bin/ - Essential commands (core system endpoints)
 * /usr/bin/ - User commands (extended functionality)
 * /etc/ - Configuration (admin and settings)
 * /var/ - Variable data (dynamic content)
 * /tmp/ - Temporary files (ephemeral operations)
 * /opt/ - Optional software (third-party integrations)
 * /home/ - User directories (tenant-specific)
 */

import { router, RouteConfig, RouteMeta } from './infinite-router.js';

/**
 * Unix Route Categories with semantic meanings
 */
export const UnixPaths = {
  // Core system endpoints - essential operations
  BIN: '/bin',
  
  // Extended functionality - user-facing features
  USR_BIN: '/usr/bin',
  
  // Configuration - admin and system settings
  ETC: '/etc',
  
  // Variable data - dynamic content and logs
  VAR: '/var',
  
  // Temporary - ephemeral operations and caching
  TMP: '/tmp',
  
  // Optional - third-party integrations
  OPT: '/opt',
  
  // User directories - tenant-specific endpoints
  HOME: '/home'
};

/**
 * Route metadata factory for Unix-style categorization
 */
export function createUnixMeta(
  category: RouteMeta['category'],
  options: Partial<RouteMeta> = {}
): RouteMeta {
  return {
    category,
    version: '1.0.0',
    deprecated: false,
    ...options
  };
}

/**
 * Register all Unix-style routes
 */
export function registerUnixRoutes(): void {
  registerBinRoutes();
  registerUsrBinRoutes();
  registerEtcRoutes();
  registerVarRoutes();
  registerTmpRoutes();
  registerOptRoutes();
  registerHomeRoutes();
}

/**
 * /bin/ - Core system endpoints
 * Essential operations that the system cannot function without
 */
function registerBinRoutes(): void {
  // Health check - essential for monitoring
  router.register({
    path: '/bin/health',
    method: 'GET',
    handler: async (req, ctx) => {
      return Response.json({
        status: 'healthy',
        timestamp: Date.now(),
        system: 'unix-routing-gateway'
      });
    },
    meta: createUnixMeta('bin', { description: 'System health check' })
  });

  // Ping - for connectivity testing
  router.register({
    path: '/bin/ping',
    method: 'GET',
    handler: async (req, ctx) => {
      return Response.json({ pong: true, timestamp: Date.now() });
    },
    meta: createUnixMeta('bin', { description: 'Connectivity test' })
  });

  // Version - system version information
  router.register({
    path: '/bin/version',
    method: 'GET',
    handler: async (req, ctx) => {
      return Response.json({
        version: '1.0.0',
        routing: 'infinite-unix',
        timestamp: Date.now()
      });
    },
    meta: createUnixMeta('bin', { description: 'Version information' })
  });

  // Echo - request echoing for debugging
  router.register({
    path: '/bin/echo',
    method: 'POST',
    handler: async (req, ctx) => {
      const body = await req.json();
      return Response.json({ echo: body, timestamp: Date.now() });
    },
    meta: createUnixMeta('bin', { description: 'Request echo for debugging' })
  });
}

/**
 * /usr/bin/ - Extended functionality
 * User-facing features and extended operations
 */
function registerUsrBinRoutes(): void {
  // User authentication
  router.register({
    path: '/usr/bin/auth/login',
    method: 'POST',
    handler: async (req, ctx) => {
      const body = await req.json();
      // Authentication logic
      return Response.json({
        success: true,
        token: 'generated_token',
        user: body.email
      });
    },
    meta: createUnixMeta('usr', { 
      description: 'User authentication',
      authRequired: false
    })
  });

  // User registration
  router.register({
    path: '/usr/bin/auth/register',
    method: 'POST',
    handler: async (req, ctx) => {
      const body = await req.json();
      return Response.json({
        success: true,
        userId: `user_${Date.now()}`
      });
    },
    meta: createUnixMeta('usr', { 
      description: 'User registration',
      authRequired: false
    })
  });

  // Product catalog
  router.register({
    path: '/usr/bin/products',
    method: 'GET',
    handler: async (req, ctx) => {
      const category = ctx.query.get('category');
      return Response.json({
        products: [],
        category: category || 'all'
      });
    },
    meta: createUnixMeta('usr', { 
      description: 'Product catalog',
      rateLimit: 100
    })
  });

  // Order processing
  router.register({
    path: '/usr/bin/orders',
    method: 'POST',
    handler: async (req, ctx) => {
      const body = await req.json();
      return Response.json({
        orderId: `order_${Date.now()}`,
        status: 'processing'
      });
    },
    meta: createUnixMeta('usr', { 
      description: 'Order processing',
      authRequired: true
    })
  });

  // Chat interface
  router.register({
    path: '/usr/bin/chat',
    method: 'POST',
    handler: async (req, ctx) => {
      const body = await req.json();
      return Response.json({
        response: 'Chat response',
        messageId: `msg_${Date.now()}`
      });
    },
    meta: createUnixMeta('usr', { 
      description: 'Chat interface',
      rateLimit: 50
    })
  });
}

/**
 * /etc/ - Configuration and admin
 * System configuration, admin operations, settings
 */
function registerEtcRoutes(): void {
  // System configuration
  router.register({
    path: '/etc/config',
    method: 'GET',
    handler: async (req, ctx) => {
      return Response.json({
        config: {},
        timestamp: Date.now()
      });
    },
    meta: createUnixMeta('etc', { 
      description: 'System configuration',
      authRequired: true
    })
  });

  // Update configuration
  router.register({
    path: '/etc/config',
    method: 'PUT',
    handler: async (req, ctx) => {
      const body = await req.json();
      return Response.json({
        success: true,
        config: body
      });
    },
    meta: createUnixMeta('etc', { 
      description: 'Update configuration',
      authRequired: true
    })
  });

  // Admin dashboard
  router.register({
    path: '/etc/admin/dashboard',
    method: 'GET',
    handler: async (req, ctx) => {
      return Response.json({
        stats: {},
        timestamp: Date.now()
      });
    },
    meta: createUnixMeta('etc', { 
      description: 'Admin dashboard',
      authRequired: true
    })
  });

  // User management
  router.register({
    path: '/etc/admin/users',
    method: 'GET',
    handler: async (req, ctx) => {
      return Response.json({
        users: [],
        total: 0
      });
    },
    meta: createUnixMeta('etc', { 
      description: 'User management',
      authRequired: true
    })
  });

  // System logs
  router.register({
    path: '/etc/logs',
    method: 'GET',
    handler: async (req, ctx) => {
      const lines = parseInt(ctx.query.get('lines') || '100', 10);
      return Response.json({
        logs: [],
        lines
      });
    },
    meta: createUnixMeta('etc', { 
      description: 'System logs',
      authRequired: true
    })
  });
}

/**
 * /var/ - Variable data
 * Dynamic content, logs, runtime data
 */
function registerVarRoutes(): void {
  // Runtime statistics
  router.register({
    path: '/var/stats',
    method: 'GET',
    handler: async (req, ctx) => {
      return Response.json({
        requests: 0,
        errors: 0,
        uptime: 0,
        timestamp: Date.now()
      });
    },
    meta: createUnixMeta('var', { 
      description: 'Runtime statistics'
    })
  });

  // Cache operations
  router.register({
    path: '/var/cache/:key',
    method: 'GET',
    handler: async (req, ctx) => {
      const key = ctx.params.key;
      return Response.json({
        key,
        value: null,
        cached: false
      });
    },
    meta: createUnixMeta('var', { 
      description: 'Cache retrieval'
    })
  });

  router.register({
    path: '/var/cache/:key',
    method: 'PUT',
    handler: async (req, ctx) => {
      const key = ctx.params.key;
      const body = await req.json();
      return Response.json({
        key,
        cached: true,
        ttl: body.ttl || 3600
      });
    },
    meta: createUnixMeta('var', { 
      description: 'Cache storage'
    })
  });

  // Dynamic content
  router.register({
    path: '/var/content/:type',
    method: 'GET',
    handler: async (req, ctx) => {
      const type = ctx.params.type;
      return Response.json({
        type,
        content: [],
        timestamp: Date.now()
      });
    },
    meta: createUnixMeta('var', { 
      description: 'Dynamic content'
    })
  });
}

/**
 * /tmp/ - Temporary operations
 * Ephemeral operations, temporary files, short-lived data
 */
function registerTmpRoutes(): void {
  // Temporary file upload
  router.register({
    path: '/tmp/upload',
    method: 'POST',
    handler: async (req, ctx) => {
      return Response.json({
        fileId: `temp_${Date.now()}`,
        expiresAt: Date.now() + 3600000 // 1 hour
      });
    },
    meta: createUnixMeta('tmp', { 
      description: 'Temporary file upload'
    })
  });

  // Temporary data storage
  router.register({
    path: '/tmp/store',
    method: 'POST',
    handler: async (req, ctx) => {
      const body = await req.json();
      return Response.json({
        key: `temp_${Date.now()}`,
        expiresAt: Date.now() + 1800000 // 30 minutes
      });
    },
    meta: createUnixMeta('tmp', { 
      description: 'Temporary data storage'
    })
  });

  // Batch operations
  router.register({
    path: '/tmp/batch',
    method: 'POST',
    handler: async (req, ctx) => {
      const body = await req.json();
      return Response.json({
        batchId: `batch_${Date.now()}`,
        operations: body.operations?.length || 0,
        status: 'queued'
      });
    },
    meta: createUnixMeta('tmp', { 
      description: 'Batch operations'
    })
  });
}

/**
 * /opt/ - Optional software
 * Third-party integrations, plugins, optional features
 */
function registerOptRoutes(): void {
  // Third-party integrations
  router.register({
    path: '/opt/integrations/:provider',
    method: 'POST',
    handler: async (req, ctx) => {
      const provider = ctx.params.provider;
      return Response.json({
        provider,
        status: 'connected',
        timestamp: Date.now()
      });
    },
    meta: createUnixMeta('opt', { 
      description: 'Third-party integration'
    })
  });

  // Plugin system
  router.register({
    path: '/opt/plugins/:name',
    method: 'GET',
    handler: async (req, ctx) => {
      const name = ctx.params.name;
      return Response.json({
        plugin: name,
        status: 'active',
        version: '1.0.0'
      });
    },
    meta: createUnixMeta('opt', { 
      description: 'Plugin information'
    })
  });

  // Webhook handlers
  router.register({
    path: '/opt/webhooks/:source',
    method: 'POST',
    handler: async (req, ctx) => {
      const source = ctx.params.source;
      return Response.json({
        source,
        processed: true,
        timestamp: Date.now()
      });
    },
    meta: createUnixMeta('opt', { 
      description: 'Webhook handler'
    })
  });
}

/**
 * /home/ - User directories
 * Tenant-specific endpoints, user data, personalized content
 */
function registerHomeRoutes(): void {
  // Tenant-specific endpoints
  router.register({
    path: '/home/:tenantId/profile',
    method: 'GET',
    handler: async (req, ctx) => {
      const tenantId = ctx.params.tenantId;
      return Response.json({
        tenantId,
        profile: {},
        timestamp: Date.now()
      });
    },
    meta: createUnixMeta('home', { 
      description: 'Tenant profile',
      authRequired: true
    })
  });

  // User-specific data
  router.register({
    path: '/home/:tenantId/data/:type',
    method: 'GET',
    handler: async (req, ctx) => {
      const tenantId = ctx.params.tenantId;
      const type = ctx.params.type;
      return Response.json({
        tenantId,
        type,
        data: [],
        timestamp: Date.now()
      });
    },
    meta: createUnixMeta('home', { 
      description: 'User-specific data',
      authRequired: true
    })
  });

  // Tenant settings
  router.register({
    path: '/home/:tenantId/settings',
    method: 'GET',
    handler: async (req, ctx) => {
      const tenantId = ctx.params.tenantId;
      return Response.json({
        tenantId,
        settings: {},
        timestamp: Date.now()
      });
    },
    meta: createUnixMeta('home', { 
      description: 'Tenant settings',
      authRequired: true
    })
  });

  router.register({
    path: '/home/:tenantId/settings',
    method: 'PUT',
    handler: async (req, ctx) => {
      const tenantId = ctx.params.tenantId;
      const body = await req.json();
      return Response.json({
        tenantId,
        settings: body,
        updated: true,
        timestamp: Date.now()
      });
    },
    meta: createUnixMeta('home', { 
      description: 'Update tenant settings',
      authRequired: true
    })
  });
}

/**
 * Route discovery and documentation
 */
export function getRouteDocumentation(): Record<string, any> {
  const routes = router.getRoutes();
  const documentation: Record<string, any> = {};

  for (const route of routes) {
    const category = route.meta?.category || 'unknown';
    if (!documentation[category]) {
      documentation[category] = [];
    }
    documentation[category].push({
      path: route.path,
      method: route.method,
      description: route.meta?.description,
      authRequired: route.meta?.authRequired,
      rateLimit: route.meta?.rateLimit,
      version: route.meta?.version
    });
  }

  return documentation;
}

/**
 * Export route tree as Unix filesystem-style tree
 */
export function getRouteTree(): string {
  return router.exportTree();
}
