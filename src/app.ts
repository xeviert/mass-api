import express, { type ErrorRequestHandler } from "express";
import morgan from "morgan";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import { CLIENT_ORIGIN, NODE_ENV } from "./config";
import authRouter from "./auth/auth-router";
import userRouter from "./user/user-router";
import ordersRouter from "./orders/orders-router";
import adminRouter from "./admin/admin-router";
import itemsRouter from "./items/items-router";
import inventoryRouter from "./inventory/inventory-router";
import donationsRouter from "./donations/donations-router";

const morganOption = NODE_ENV === "production" ? "tiny" : "common";
const localhostOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (NODE_ENV !== "production" && localhostOrigin.test(origin)) {
      callback(null, true);
      return;
    }
    if (CLIENT_ORIGIN && origin === CLIENT_ORIGIN) {
      callback(null, true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
};

const app = express();
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/items", itemsRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/donations", donationsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/admin", adminRouter);

app.get("/", (_req, res) => {
  res
    .type("text")
    .send(
      [
        "MASS API - Mutual Aid & Shared Services",
        "Portfolio demo API using JSON-file storage.",
        "Health: /api/health",
        "Catalog: /api/items",
      ].join("\n"),
    );
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "mass-api" });
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (NODE_ENV === "production") {
    res.status(500).json({ error: { message: "server error" } });
  } else {
    console.error(error);
    res.status(500).json({ message: (error as Error).message, error });
  }
};
app.use(errorHandler);

export default app;
