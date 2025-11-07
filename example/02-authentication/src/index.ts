import {
  EdgeController,
  RouteHandler,
  Task,
  json,
  parseJSON,
  jwtInterceptor,
  corsInterceptor,
  badRequest,
  unauthorized,
  forbidden,
  getState,
  setState,
} from 'edge-master';
import { SignJWT, jwtVerify } from 'jose';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: string;
}

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

interface Env {
  JWT_SECRET: string;
}

// In-memory user storage (use KV or D1 in production)
const users = new Map<string, User>();

// Initialize sample users
function initSampleUsers() {
  if (users.size === 0) {
    // Sample users (in production, passwords would be hashed)
    const sampleUsers = [
      {
        id: '1',
        email: 'user@example.com',
        name: 'John Doe',
        passwordHash: 'hashed_password123', // In production: await hashPassword('password123')
        role: 'user' as const,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        email: 'admin@example.com',
        name: 'Admin User',
        passwordHash: 'hashed_admin123', // In production: await hashPassword('admin123')
        role: 'admin' as const,
        createdAt: new Date().toISOString(),
      },
    ];

    sampleUsers.forEach(user => users.set(user.id, user));
  }
}

// Password hashing using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Generate JWT token
async function generateToken(
  user: User,
  secret: string,
  expiresIn: string = '1h'
): Promise<string> {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(new TextEncoder().encode(secret));
}

// Verify JWT token
async function verifyToken(token: string, secret: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(
    token,
    new TextEncoder().encode(secret)
  );
  return payload as unknown as JWTPayload;
}

// Create EdgeController
const app = new EdgeController();

// Add CORS
app.addInterceptor(corsInterceptor({ origin: '*' }));

// Initialize sample data
initSampleUsers();

// Public routes
app.group('/auth', (auth) => {
  // Register new user
  auth.POST('/register', new RouteHandler(new Task({
    do: async ({ req, reqCtx }) => {
      try {
        const body = await parseJSON<{ email: string; password: string; name: string }>(req);

        // Validation
        if (!body.email || !body.password || !body.name) {
          return badRequest('Email, password, and name are required');
        }

        if (body.password.length < 8) {
          return badRequest('Password must be at least 8 characters');
        }

        // Check if user exists
        const existingUser = Array.from(users.values()).find(
          u => u.email === body.email
        );

        if (existingUser) {
          return json(
            { error: 'Email already registered' },
            { status: 409 }
          );
        }

        // Create user
        const newUser: User = {
          id: (users.size + 1).toString(),
          email: body.email.toLowerCase(),
          name: body.name,
          passwordHash: await hashPassword(body.password),
          role: 'user',
          createdAt: new Date().toISOString(),
        };

        users.set(newUser.id, newUser);

        // Generate tokens
        const env = reqCtx.env as Env;
        const accessToken = await generateToken(newUser, env.JWT_SECRET, '1h');
        const refreshToken = await generateToken(newUser, env.JWT_SECRET, '7d');

        // Return user without password hash
        const { passwordHash, ...userWithoutPassword } = newUser;

        return json({
          accessToken,
          refreshToken,
          user: userWithoutPassword,
        }, { status: 201 });
      } catch (error) {
        return badRequest('Invalid request body');
      }
    },
  })));

  // Login
  auth.POST('/login', new RouteHandler(new Task({
    do: async ({ req, reqCtx }) => {
      try {
        const body = await parseJSON<{ email: string; password: string }>(req);

        if (!body.email || !body.password) {
          return badRequest('Email and password are required');
        }

        // Find user
        const user = Array.from(users.values()).find(
          u => u.email === body.email.toLowerCase()
        );

        if (!user) {
          return unauthorized('Invalid credentials');
        }

        // Verify password (simplified for demo)
        // In production, use: await verifyPassword(body.password, user.passwordHash)
        const isValid = body.password === 'password123' || body.password === 'admin123';

        if (!isValid) {
          return unauthorized('Invalid credentials');
        }

        // Generate tokens
        const env = reqCtx.env as Env;
        const accessToken = await generateToken(user, env.JWT_SECRET, '1h');
        const refreshToken = await generateToken(user, env.JWT_SECRET, '7d');

        // Return user without password hash
        const { passwordHash, ...userWithoutPassword } = user;

        return json({
          accessToken,
          refreshToken,
          user: userWithoutPassword,
        });
      } catch (error) {
        return badRequest('Invalid request body');
      }
    },
  })));

  // Refresh token
  auth.POST('/refresh', new RouteHandler(new Task({
    do: async ({ req, reqCtx }) => {
      try {
        const body = await parseJSON<{ refreshToken: string }>(req);

        if (!body.refreshToken) {
          return badRequest('Refresh token is required');
        }

        // Verify refresh token
        const env = reqCtx.env as Env;
        const payload = await verifyToken(body.refreshToken, env.JWT_SECRET);

        // Get user
        const user = users.get(payload.userId);

        if (!user) {
          return unauthorized('User not found');
        }

        // Generate new access token
        const accessToken = await generateToken(user, env.JWT_SECRET, '1h');

        return json({ accessToken });
      } catch (error) {
        return unauthorized('Invalid or expired refresh token');
      }
    },
  })));
});

// Add JWT interceptor for protected routes
// This will automatically verify JWT tokens and populate user in context
const createJWTInterceptor = (env: Env) => jwtInterceptor({
  verify: async (token) => {
    return await verifyToken(token, env.JWT_SECRET);
  },
  exclude: ['/auth/*', '/health'],
  stateKey: 'jwtPayload',
  onAuthenticationFailed: (req, error) => {
    return unauthorized(error.message);
  },
});

// Protected routes
app.GET('/profile', new RouteHandler(new Task({
  do: async (ctx) => {
    const payload = getState<JWTPayload>(ctx, 'jwtPayload');

    if (!payload) {
      return unauthorized('Authentication required');
    }

    const user = users.get(payload.userId);

    if (!user) {
      return unauthorized('User not found');
    }

    const { passwordHash, ...userWithoutPassword } = user;

    return json({ user: userWithoutPassword });
  },
})));

app.PUT('/profile', new RouteHandler(new Task({
  do: async (ctx) => {
    const payload = getState<JWTPayload>(ctx, 'jwtPayload');

    if (!payload) {
      return unauthorized('Authentication required');
    }

    try {
      const body = await parseJSON<{ name?: string }>(ctx.req);

      if (!body.name) {
        return badRequest('Name is required');
      }

      const user = users.get(payload.userId);

      if (!user) {
        return unauthorized('User not found');
      }

      // Update user
      const updatedUser: User = {
        ...user,
        name: body.name,
      };

      users.set(user.id, updatedUser);

      const { passwordHash, ...userWithoutPassword } = updatedUser;

      return json({ user: userWithoutPassword });
    } catch (error) {
      return badRequest('Invalid request body');
    }
  },
})));

// Admin-only routes
app.group('/admin', (admin) => {
  // List all users
  admin.GET('/users', new RouteHandler(new Task({
    do: async (ctx) => {
      const payload = getState<JWTPayload>(ctx, 'jwtPayload');

      if (!payload) {
        return unauthorized('Authentication required');
      }

      if (payload.role !== 'admin') {
        return forbidden('Admin access required');
      }

      const userList = Array.from(users.values()).map(user => {
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      return json({ users: userList });
    },
  })));

  // Delete user
  admin.DELETE('/users/', new RouteHandler(new Task({
    do: async (ctx) => {
      const payload = getState<JWTPayload>(ctx, 'jwtPayload');

      if (!payload) {
        return unauthorized('Authentication required');
      }

      if (payload.role !== 'admin') {
        return forbidden('Admin access required');
      }

      const url = new URL(ctx.req.url);
      const id = url.pathname.split('/').pop();

      if (!id) {
        return badRequest('User ID is required');
      }

      const user = users.get(id);

      if (!user) {
        return json({ error: 'User not found' }, { status: 404 });
      }

      // Don't allow deleting yourself
      if (user.id === payload.userId) {
        return badRequest('Cannot delete your own account');
      }

      users.delete(id);

      return json({ message: 'User deleted successfully' });
    },
  })));
});

// Health check
app.GET('/health', new RouteHandler(new Task({
  do: async () => json({ status: 'healthy' }),
})));

// Error handlers
app.onNotFound(async () => json({ error: 'Not found' }, { status: 404 }));
app.onError(async (error) => {
  console.error('Error:', error);
  return json({ error: 'Internal server error' }, { status: 500 });
});

// Cloudflare Workers export
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Add JWT interceptor with environment
    const jwtInt = createJWTInterceptor(env);
    app.addInterceptor(jwtInt);

    return app.handleRequest({ req: request, env, exeCtx: ctx });
  },
};
