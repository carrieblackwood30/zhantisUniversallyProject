// server.js
require("dotenv").config();
require("./db");

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const compression = require("compression");

const app = express();

const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const origins = CORS_ORIGIN.split(",").map(o => o.trim()).filter(Boolean);  

app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use(compression());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

function mountRoute(routePath, routeModule, name) {
  if (!routeModule) {
    console.warn(`[mountRoute] ${name} is falsy, skipping ${routePath}`);
    return;
  }
  const router = routeModule.default || routeModule;
  if (typeof router === "function" || (router && typeof router.use === "function")) {
    app.use(routePath, router);
    console.log(`[mountRoute] mounted ${name} -> ${routePath}`);
  } else {
    console.warn(`[mountRoute] ${name} is not a router, skipping. typeof=${typeof router}`);
  }
}

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const uploadRoutes = require("./routes/upload");
const customerRoutes = require("./routes/customer");
const groupRoutes = require("./routes/groups");
let subgroupRoutes;
try { subgroupRoutes = require("./routes/subgroups"); } catch (e) { subgroupRoutes = null; console.error("[server] require ./routes/subgroups failed:", e && e.stack ? e.stack : e); }
const attributeRoutes = require("./routes/attributes");
let definitionsRoutes;
try { definitionsRoutes = require("./routes/definitions"); } catch (e) { definitionsRoutes = null; }

mountRoute("/api/auth", authRoutes, "authRoutes");
mountRoute("/api/products", productRoutes, "productRoutes");
mountRoute("/api/orders", orderRoutes, "orderRoutes");
mountRoute("/api/upload", uploadRoutes, "uploadRoutes");
mountRoute("/api/customer", customerRoutes, "customerRoutes");
mountRoute("/api/groups", groupRoutes, "groupRoutes");
mountRoute("/api/subgroups", subgroupRoutes, "subgroupRoutes");
mountRoute("/api/attributes", attributeRoutes, "attributeRoutes");
mountRoute("/api/definitions", definitionsRoutes, "definitionsRoutes");

if (app._router && app._router.stack) {
  console.log("Mounted routes:");
  app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      console.log("  route:", r.route.path, Object.keys(r.route.methods).join(","));
    } else if (r.name === "router" && r.regexp) {
      console.log("  router:", r.regexp);
    }
  });
}

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, req, res, next) => {
  console.error("[server] Unhandled error:", err.stack || err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
