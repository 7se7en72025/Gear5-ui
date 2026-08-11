/**
 * Every bundler that targets React replaces `process.env.NODE_ENV` at build
 * time, so the dev-only warnings in this package compile away in production.
 *
 * Declaring just this shape avoids depending on `@types/node`, which would leak
 * Node globals into the types consumers see for a browser library.
 */
declare const process: {
  readonly env: {
    readonly NODE_ENV?: "development" | "production" | "test";
  };
};
