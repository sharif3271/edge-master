/**
 * Basic OpenAPI 3.0 schema generation utilities
 * This is a simplified implementation - for advanced features, consider using a dedicated OpenAPI library
 */

export interface OpenAPIInfo {
  title: string;
  version: string;
  description?: string;
  contact?: {
    name?: string;
    email?: string;
    url?: string;
  };
  license?: {
    name: string;
    url?: string;
  };
}

export interface OpenAPIServer {
  url: string;
  description?: string;
}

export interface OpenAPIParameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  schema: any;
}

export interface OpenAPIRequestBody {
  description?: string;
  required?: boolean;
  content: {
    [mediaType: string]: {
      schema: any;
    };
  };
}

export interface OpenAPIResponse {
  description: string;
  content?: {
    [mediaType: string]: {
      schema: any;
    };
  };
}

export interface OpenAPIOperation {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: OpenAPIParameter[];
  requestBody?: OpenAPIRequestBody;
  responses: {
    [statusCode: string]: OpenAPIResponse;
  };
  security?: Array<{ [securityScheme: string]: string[] }>;
}

export interface OpenAPIPath {
  get?: OpenAPIOperation;
  post?: OpenAPIOperation;
  put?: OpenAPIOperation;
  delete?: OpenAPIOperation;
  patch?: OpenAPIOperation;
  options?: OpenAPIOperation;
  head?: OpenAPIOperation;
}

export interface OpenAPISecurityScheme {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  description?: string;
  name?: string;
  in?: 'query' | 'header' | 'cookie';
  scheme?: string;
  bearerFormat?: string;
}

export interface OpenAPISpec {
  openapi: string;
  info: OpenAPIInfo;
  servers?: OpenAPIServer[];
  paths: {
    [path: string]: OpenAPIPath;
  };
  components?: {
    schemas?: { [name: string]: any };
    securitySchemes?: { [name: string]: OpenAPISecurityScheme };
  };
  tags?: Array<{ name: string; description?: string }>;
}

/**
 * Creates a basic OpenAPI specification
 */
export function createOpenAPISpec(info: OpenAPIInfo): OpenAPISpec {
  return {
    openapi: '3.0.0',
    info,
    paths: {},
  };
}

/**
 * Adds a server to the OpenAPI spec
 */
export function addServer(spec: OpenAPISpec, server: OpenAPIServer): OpenAPISpec {
  if (!spec.servers) {
    spec.servers = [];
  }
  spec.servers.push(server);
  return spec;
}

/**
 * Adds a path to the OpenAPI spec
 */
export function addPath(
  spec: OpenAPISpec,
  path: string,
  method: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head',
  operation: OpenAPIOperation
): OpenAPISpec {
  if (!spec.paths[path]) {
    spec.paths[path] = {};
  }
  spec.paths[path][method] = operation;
  return spec;
}

/**
 * Adds a schema to the components section
 */
export function addSchema(spec: OpenAPISpec, name: string, schema: any): OpenAPISpec {
  if (!spec.components) {
    spec.components = {};
  }
  if (!spec.components.schemas) {
    spec.components.schemas = {};
  }
  spec.components.schemas[name] = schema;
  return spec;
}

/**
 * Adds a security scheme to the components section
 */
export function addSecurityScheme(
  spec: OpenAPISpec,
  name: string,
  scheme: OpenAPISecurityScheme
): OpenAPISpec {
  if (!spec.components) {
    spec.components = {};
  }
  if (!spec.components.securitySchemes) {
    spec.components.securitySchemes = {};
  }
  spec.components.securitySchemes[name] = scheme;
  return spec;
}

/**
 * Adds a tag to the OpenAPI spec
 */
export function addTag(spec: OpenAPISpec, name: string, description?: string): OpenAPISpec {
  if (!spec.tags) {
    spec.tags = [];
  }
  spec.tags.push({ name, description });
  return spec;
}

/**
 * Helper to create a JSON response schema
 */
export function jsonResponse(description: string, schema: any): OpenAPIResponse {
  return {
    description,
    content: {
      'application/json': {
        schema,
      },
    },
  };
}

/**
 * Helper to create a JSON request body
 */
export function jsonRequestBody(schema: any, required: boolean = true): OpenAPIRequestBody {
  return {
    required,
    content: {
      'application/json': {
        schema,
      },
    },
  };
}

/**
 * Helper to create common response schemas
 */
export const commonResponses = {
  success: (schema?: any): OpenAPIResponse =>
    jsonResponse('Successful response', schema || { type: 'object' }),

  created: (schema?: any): OpenAPIResponse =>
    jsonResponse('Resource created', schema || { type: 'object' }),

  noContent: (): OpenAPIResponse => ({
    description: 'No content',
  }),

  badRequest: (): OpenAPIResponse =>
    jsonResponse('Bad request', {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
    }),

  unauthorized: (): OpenAPIResponse =>
    jsonResponse('Unauthorized', {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
    }),

  forbidden: (): OpenAPIResponse =>
    jsonResponse('Forbidden', {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
    }),

  notFound: (): OpenAPIResponse =>
    jsonResponse('Not found', {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
    }),

  serverError: (): OpenAPIResponse =>
    jsonResponse('Internal server error', {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
    }),
};

/**
 * Helper to create common security schemes
 */
export const commonSecuritySchemes = {
  bearerAuth: (): OpenAPISecurityScheme => ({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  }),

  apiKey: (name: string = 'X-API-Key', inLocation: 'header' | 'query' = 'header'): OpenAPISecurityScheme => ({
    type: 'apiKey',
    name,
    in: inLocation,
  }),
};
