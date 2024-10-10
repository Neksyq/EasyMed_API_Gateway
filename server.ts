import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import morgan from "morgan";

dotenv.config();

const app = express();

// Logger for HTTP requests
app.use(morgan("dev"));

// Helper function to configure API proxy with error handling
const apiProxy = (path: string, target: string | undefined): void => {
  if (!target) {
    console.error(`Target not defined for path: ${path}`);
    return;
  }

  const proxyMiddleware = createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (pathReq, req) => pathReq.replace(path, ""),
  });

  // Attach error handling to the proxy middleware
  app.use(path, (req: Request, res: Response, next: NextFunction) => {
    proxyMiddleware(req, res, (err) => {
      if (err) {
        console.error("Proxy error:", err.message);
        res.status(500).json({ error: "Proxy error", details: err.message });
      } else {
        next();
      }
    });
  });
};

// Routes and their target services
apiProxy("/api/prescriptions", process.env.PRESCRIPTION_SERVICE_URL);
// apiProxy("/api/auth", process.env.AUTH_SERVICE_URL);
// apiProxy("/api/fulfillment", process.env.FULFILLMENT_SERVICE_URL);
// apiProxy("/api/delivery", process.env.DELIVERY_SERVICE_URL);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "API Gateway is running." });
});

// Start the server
const API_GATEWAY_PORT = process.env.API_GATEWAY_PORT;
app.listen(API_GATEWAY_PORT, () => {
  console.log(`API Gateway is running on port ${API_GATEWAY_PORT}`);
});
