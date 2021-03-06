const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Orders Endpoints", function () {
  let db;

  before("make knex instance", () => {
    db = helpers.makeKnexInstance();
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

   /**
   * @description Post a order by user
   **/
  /* POST */
  describe("POST api/orders", () => {
    it("creates a site and responds with 201 and the new site", () => {
      const newOrder = makeSitesArr();
      return supertest(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newOrder[0])
        .expect(201)
        .then((res) => {
          expect(res.body).to.equal(newOrder[0]);
          supertest(app)
            .get(`/s/${res.body.id}`)
            .then((newRes) => {
              expect(newRes.body).to.equal(newOrder[0]);
            });
        });
    });
  })
})