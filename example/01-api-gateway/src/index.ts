import {
  EdgeController,
  RouteHandler,
  Task,
  json,
  parseJSON,
  getQuery,
  getQueryOr,
  corsInterceptor,
  loggingInterceptor,
  badRequest,
  notFound,
  serverError,
} from 'edge-master';

// In-memory storage (for demo purposes)
// In production, use KV, D1, or external database
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

let users: Map<string, User> = new Map();

// Initialize with sample data
function initSampleData() {
  if (users.size === 0) {
    const sampleUsers = [
      { id: '1', name: 'Alice Johnson', email: 'alice@example.com' },
      { id: '2', name: 'Bob Smith', email: 'bob@example.com' },
      { id: '3', name: 'Carol Williams', email: 'carol@example.com' },
    ];

    sampleUsers.forEach(user => {
      users.set(user.id, {
        ...user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
  }
}

// Validation helpers
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateUser(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else if (!validateEmail(data.email)) {
    errors.push('Email must be a valid email address');
  }

  return { valid: errors.length === 0, errors };
}

// Extract ID from path
function extractId(req: Request): string | null {
  const url = new URL(req.url);
  const parts = url.pathname.split('/');
  // /api/users/:id -> parts[3]
  return parts[3] || null;
}

// Create EdgeController
const app = new EdgeController();

// Add CORS support
app.addInterceptor(corsInterceptor({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Add logging
const { request, response } = loggingInterceptor({ level: 'info' });
app.addInterceptor(request);
app.addInterceptor(response);

// Initialize sample data
initSampleData();

// Health check endpoint
app.GET('/health', new RouteHandler(new Task({
  do: async () => json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }),
})));

// API routes group
app.group('/api', (api) => {
  // List users with pagination
  api.GET('/users', new RouteHandler(new Task({
    do: async ({ req }) => {
      const page = parseInt(getQueryOr(req, 'page', '1'));
      const limit = parseInt(getQueryOr(req, 'limit', '10'));
      const search = getQuery(req, 'search');

      let userList = Array.from(users.values());

      // Search filter
      if (search) {
        userList = userList.filter(user =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Pagination
      const total = userList.length;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedUsers = userList.slice(start, end);

      return json({
        users: paginatedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    },
  })));

  // Get user by ID
  api.GET('/users/', new RouteHandler(new Task({
    do: async ({ req }) => {
      const id = extractId(req);

      if (!id) {
        return badRequest('User ID is required');
      }

      const user = users.get(id);

      if (!user) {
        return notFound(`User with ID ${id} not found`);
      }

      return json({ user });
    },
  })));

  // Create user
  api.POST('/users', new RouteHandler(new Task({
    do: async ({ req }) => {
      try {
        const body = await parseJSON(req);

        // Validate input
        const validation = validateUser(body);
        if (!validation.valid) {
          return badRequest(validation.errors.join(', '));
        }

        // Check if email already exists
        const existingUser = Array.from(users.values()).find(
          u => u.email === body.email
        );

        if (existingUser) {
          return json(
            { error: 'Email already exists' },
            { status: 409 }
          );
        }

        // Create new user
        const newUser: User = {
          id: (users.size + 1).toString(),
          name: body.name.trim(),
          email: body.email.toLowerCase(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        users.set(newUser.id, newUser);

        return json({ user: newUser }, { status: 201 });
      } catch (error) {
        return badRequest('Invalid JSON body');
      }
    },
  })));

  // Update user
  api.PUT('/users/', new RouteHandler(new Task({
    do: async ({ req }) => {
      const id = extractId(req);

      if (!id) {
        return badRequest('User ID is required');
      }

      const user = users.get(id);

      if (!user) {
        return notFound(`User with ID ${id} not found`);
      }

      try {
        const body = await parseJSON(req);

        // Validate input
        const validation = validateUser(body);
        if (!validation.valid) {
          return badRequest(validation.errors.join(', '));
        }

        // Check if email is taken by another user
        const existingUser = Array.from(users.values()).find(
          u => u.email === body.email && u.id !== id
        );

        if (existingUser) {
          return json(
            { error: 'Email already exists' },
            { status: 409 }
          );
        }

        // Update user
        const updatedUser: User = {
          ...user,
          name: body.name.trim(),
          email: body.email.toLowerCase(),
          updatedAt: new Date().toISOString(),
        };

        users.set(id, updatedUser);

        return json({ user: updatedUser });
      } catch (error) {
        return badRequest('Invalid JSON body');
      }
    },
  })));

  // Delete user
  api.DELETE('/users/', new RouteHandler(new Task({
    do: async ({ req }) => {
      const id = extractId(req);

      if (!id) {
        return badRequest('User ID is required');
      }

      const user = users.get(id);

      if (!user) {
        return notFound(`User with ID ${id} not found`);
      }

      users.delete(id);

      return json({
        message: 'User deleted successfully',
        user,
      });
    },
  })));
});

// Custom 404 handler
app.onNotFound(async ({ req }) => {
  const url = new URL(req.url);
  return notFound(`Route ${url.pathname} not found`);
});

// Custom error handler
app.onError(async (error) => {
  console.error('Unhandled error:', error);
  return serverError('An unexpected error occurred');
});

// Cloudflare Workers export
export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    return app.handleRequest({ req: request, env, exeCtx: ctx });
  },
};
