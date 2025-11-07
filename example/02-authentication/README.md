# JWT Authentication Example

Complete authentication and authorization system with JWT tokens.

## Features

- ✅ User login with JWT token generation
- ✅ JWT verification interceptor
- ✅ Protected routes
- ✅ Role-based access control (RBAC)
- ✅ Token refresh
- ✅ Password hashing (Web Crypto API)
- ✅ Public/private route separation

## Setup

This example uses the `jose` library for JWT handling, which is optimized for edge runtimes.

```bash
npm install
```

## API Endpoints

### Public Endpoints

- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Register new user
- `POST /auth/refresh` - Refresh access token

### Protected Endpoints

- `GET /profile` - Get current user profile (requires authentication)
- `PUT /profile` - Update current user profile (requires authentication)
- `GET /admin/users` - List all users (requires admin role)
- `DELETE /admin/users/:id` - Delete user (requires admin role)

## Environment Variables

Create a `.dev.vars` file:

```
JWT_SECRET=your-secret-key-here-min-32-characters-long
```

## Example Requests

### Register

```bash
curl -X POST http://localhost:8787/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:8787/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "1",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### Access Protected Route

```bash
curl http://localhost:8787/profile \
  -H "Authorization: Bearer eyJhbGc..."
```

### Admin Endpoint

```bash
curl http://localhost:8787/admin/users \
  -H "Authorization: Bearer eyJhbGc..."
```

## Code Highlights

### JWT Interceptor

```typescript
import { jwtInterceptor } from 'edge-master';
import { jwtVerify } from 'jose';

const jwt = jwtInterceptor({
  verify: async (token) => {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(env.JWT_SECRET)
    );
    return payload;
  },
  exclude: ['/auth/*', '/health'],
  stateKey: 'user',
});

app.addInterceptor(jwt);
```

### Role-Based Access Control

```typescript
app.GET('/admin/users', new RouteHandler(new Task({
  do: async (ctx) => {
    const user = getState(ctx, 'user');

    if (user.role !== 'admin') {
      return forbidden('Admin access required');
    }

    // Admin-only logic
  }
})));
```

## Security Features

1. **Password Hashing** - Using Web Crypto API with PBKDF2
2. **JWT Tokens** - Secure token generation with expiration
3. **Refresh Tokens** - Long-lived tokens for getting new access tokens
4. **Role-Based Access** - User and admin roles
5. **Token Validation** - Automatic validation via interceptor

## Learning Points

- Using `jose` for JWT in edge environments
- Context state for passing user data
- Excluding routes from authentication
- Role-based authorization patterns
- Secure password storage
