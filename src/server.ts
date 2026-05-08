import "dotenv/config";
import app from "./app";
import config from "./config";
import stores from "./store";
import seed from "./store/seed";

async function start(): Promise<void> {
  await stores.init();
  await seed.run({ stores, config });

  app.locals.stores = stores;

  app.listen(config.PORT, () => {
    console.log(`Express server is listening at http://localhost:${config.PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
