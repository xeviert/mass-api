const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Orders Endpoints", function () {
  let db;

  const {
    testUsers,
    testOrders,
    testOrderItems,
  } = helpers.makeContactsFixtures();

  before("make knex instance", () => {
    db = helpers.makeKnexInstance();
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  /**
   * @description GET orders from all users
   **/
  /* GET */
  describe("GET api/admin/orders", () => {
    context(`User Validation`, () => {
      beforeEach("insert users and contacts", () => {
        return helpers.seedAllTables(
          db, 
          testUsers, 
          testOrders, 
          testOrderItems
        );
      });
      it(`response with 200 which indicates that getTimeline is working correctly`, () => {
				return supertest(app)
					.get("/api/admin/orders")
					.set("Authorization", helpers.makeAuthHeader(testUsers[0]))
					.expect(200);
			});
    });
  });
});
