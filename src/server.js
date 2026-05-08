require("dotenv").config();
const app = require("./app");
const config = require("./config");
const stores = require("./store");
const seed = require("./store/seed");

async function start() {
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
