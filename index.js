const app = require("./src/app.js");
const pool = require("./src/pool.js");
const { postgreSqlDefault: DEFAULT_OPTS } = require("./configs.js");

pool
  .connect(DEFAULT_OPTS)
  .then(() => {
    app().listen(3005, () => {
      console.log("Listening on port 3005");
    });
  })
  .catch((err) => console.error(err));
