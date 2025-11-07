# API Gateway Example

A complete REST API example demonstrating CRUD operations with EdgeMaster.

## Features

- ✅ RESTful routing with HTTP method helpers
- ✅ Request body parsing (JSON)
- ✅ Query parameter handling
- ✅ Response helpers
- ✅ Error handling
- ✅ Input validation
- ✅ CORS support
- ✅ Request/Response logging

## API Endpoints

### Users

- `GET /api/users` - List all users (with pagination)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Health Check

- `GET /health` - Health check endpoint

## Running Locally

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Deploy to Cloudflare Workers
npm run deploy
```

## Example Requests

### List Users

```bash
curl http://localhost:8787/api/users?page=1&limit=10
```

### Get User

```bash
curl http://localhost:8787/api/users/1
```

### Create User

```bash
curl -X POST http://localhost:8787/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

### Update User

```bash
curl -X PUT http://localhost:8787/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "John Updated", "email": "john.updated@example.com"}'
```

### Delete User

```bash
curl -X DELETE http://localhost:8787/api/users/1
```

## Code Highlights

### HTTP Method Helpers

```typescript
app.GET('/api/users', listUsersHandler);
app.POST('/api/users', createUserHandler);
app.PUT('/api/users/:id', updateUserHandler);
```

### Request Parsing

```typescript
const body = await parseJSON(req);
const page = getQuery(req, 'page') || '1';
```

### Response Helpers

```typescript
return json({ users: [...] });
return json({ error: 'Not found' }, { status: 404 });
```

## Learning Points

1. **Route Organization** - Using route grouping for `/api/*` endpoints
2. **Error Handling** - Centralized error handling with `onError()`
3. **Validation** - Input validation with clear error messages
4. **REST Conventions** - Following HTTP status codes and REST patterns
