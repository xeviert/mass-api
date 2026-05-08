import express from "express";
import DonationsService from "./donations-service";
import {
  requireAuth,
  requireAdmin,
  requireAuthOptional,
} from "../middleware/jwt-auth";

const donationsRouter = express.Router();
const jsonBodyParser = express.json();

donationsRouter.get("/", requireAuth, requireAdmin, (req, res) => {
  const stores = req.app.locals.stores;
  res.json(
    DonationsService.listAll(stores).map((d) => DonationsService.serialize(d, stores)),
  );
});

donationsRouter.get("/mine", requireAuth, (req, res) => {
  const stores = req.app.locals.stores;
  const user = req.user!;
  res.json(
    DonationsService.listForUser(stores, user.id).map((d) =>
      DonationsService.serialize(d, stores),
    ),
  );
});

donationsRouter.post("/", requireAuthOptional, jsonBodyParser, async (req, res, next) => {
  try {
    const stores = req.app.locals.stores;
    const body = req.body ?? {};
    const validationError = DonationsService.validateNew(body, stores);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }
    const userId = req.user ? req.user.id : null;
    const donation = await DonationsService.create(stores, userId, body);
    res.status(201).json(DonationsService.serialize(donation, stores));
  } catch (error) {
    next(error);
  }
});

export default donationsRouter;
