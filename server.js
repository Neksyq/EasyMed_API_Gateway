require("dotenv").config();
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const morgan = require("morgan");

const app = express();

app.use(express.json());
app.use(morgan("combined"));

const apiProxy = (path, target) => {
  app.use(
    path,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: (pathReq, req) => pathReq.replace(path, ""),
      onError: (err, req, res) => {
        res.status(500).json({ error: "Proxy error", details: err.message });
      },
    })
  );
};

// Routes and their target services
// apiProxy("/api/auth", process.env.AUTH_SERVICE_URL);
apiProxy("/api/prescriptions", process.env.PRESCRIPTION_SERVICE_URL);
// apiProxy("/api/fulfillment", process.env.FULFILLMENT_SERVICE_URL);
// apiProxy("/api/delivery", process.env.DELIVERY_SERVICE_URL);

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "API Gateway is running." });
});

// Start the server
const API_GATEWAY_PORT = process.env.API_GATEWAY_PORT;
app.listen(API_GATEWAY_PORT, () => {
  console.log(`API Gateway is running on port ${API_GATEWAY_PORT}`);
});
