import { IRequestInterceptor, IResponseInterceptor, InterceptorType } from '../types/interceptor';
import { Context, ContextWithRes } from '../types/base';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggingOptions {
  /**
   * Minimum log level to output
   * @default 'info'
   */
  level?: LogLevel;

  /**
   * Custom logger function
   * @default console.log
   */
  logger?: (level: LogLevel, message: string, data?: any) => void;

  /**
   * Whether to log request details
   * @default true
   */
  logRequest?: boolean;

  /**
   * Whether to log response details
   * @default true
   */
  logResponse?: boolean;

  /**
   * Whether to log timing information
   * @default true
   */
  logTiming?: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const defaultLogger = (level: LogLevel, message: string, data?: any) => {
  const logFn = console[level] || console.log;
  if (data) {
    logFn(`[${level.toUpperCase()}] ${message}`, data);
  } else {
    logFn(`[${level.toUpperCase()}] ${message}`);
  }
};

/**
 * Creates a request logging interceptor
 */
export function requestLoggingInterceptor(options: LoggingOptions = {}): IRequestInterceptor {
  const {
    level = 'info',
    logger = defaultLogger,
    logRequest = true,
  } = options;

  const minLevel = LOG_LEVELS[level];

  return {
    type: InterceptorType.Request,
    async intercept(ctx: Context): Promise<Request> {
      if (!logRequest || LOG_LEVELS.info < minLevel) {
        return ctx.reqCtx.req;
      }

      const req = ctx.reqCtx.req;
      const url = new URL(req.url);

      logger('info', 'Incoming request', {
        method: req.method,
        url: req.url,
        pathname: url.pathname,
        search: url.search,
        headers: Object.fromEntries(req.headers.entries()),
      });

      // Store request start time in state for timing
      ctx.state.set('__requestStartTime', Date.now());

      return req;
    },
  };
}

/**
 * Creates a response logging interceptor
 */
export function responseLoggingInterceptor(options: LoggingOptions = {}): IResponseInterceptor {
  const {
    level = 'info',
    logger = defaultLogger,
    logResponse = true,
    logTiming = true,
  } = options;

  const minLevel = LOG_LEVELS[level];

  return {
    type: InterceptorType.Response,
    async intercept(ctx: ContextWithRes): Promise<Response> {
      if (!logResponse || LOG_LEVELS.info < minLevel) {
        return ctx.res;
      }

      const url = new URL(ctx.reqCtx.req.url);
      const logData: any = {
        method: ctx.reqCtx.req.method,
        pathname: url.pathname,
        status: ctx.res.status,
        statusText: ctx.res.statusText,
      };

      // Add timing information if available
      if (logTiming) {
        const startTime = ctx.state.get('__requestStartTime');
        if (startTime) {
          logData.duration = `${Date.now() - startTime}ms`;
        }
      }

      // Log based on status code
      if (ctx.res.status >= 500) {
        logger('error', 'Response error', logData);
      } else if (ctx.res.status >= 400) {
        logger('warn', 'Response client error', logData);
      } else {
        logger('info', 'Response success', logData);
      }

      return ctx.res;
    },
  };
}

/**
 * Creates both request and response logging interceptors
 */
export function loggingInterceptor(options: LoggingOptions = {}) {
  return {
    request: requestLoggingInterceptor(options),
    response: responseLoggingInterceptor(options),
  };
}
