const request = require("supertest");
const buildApp = require("../../app");
const UserRepo = require("../../repos/user-repo");
const pool = require("../../pool");
const Context = require("../context");

//Set up connection to database before running any tests
let context;
beforeAll(async () => {
  context = await Context.build();
});

// reset the db after each test ( more applicable if there were multiple tests to occur on each DB)
beforeEach(async () => {
  context.reset();
});

//To disconnect from DB once all tests are complete, and return to entry point of test (CLI where running with script)
afterAll(() => {
  return context.close();
});

it("create a user", async () => {
  const startingCount = await UserRepo.count();
  //   expect(startingCount).toEqual(0)

  await request(buildApp())
    .post("/users")
    .send({ username: "testuser", bio: "test bio" })
    .expect(200);

  const finishCount = await UserRepo.count();
  expect(finishCount - startingCount).toEqual(1);
});
