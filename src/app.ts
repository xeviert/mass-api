import express, { type ErrorRequestHandler } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import { NODE_ENV } from "./config";
import authRouter from "./auth/auth-router";
import userRouter from "./user/user-router";
import ordersRouter from "./orders/orders-router";
import adminRouter from "./admin/admin-router";
import itemsRouter from "./items/items-router";

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

const app = express();
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/items", itemsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/admin", adminRouter);

app.get("/", (_req, res) => {
  res.send("Hello, MASS!");
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
