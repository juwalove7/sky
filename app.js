const express = require("express");
const authRouter = require("./routes/auth");
const postsRouter = require("./routes/posts");

const usersRouter = require("./routes/users");

const { sequelize } = require("./models");
const app = express();
const port = 1004;

app.use(express.json());
app.use(authRouter);
app.use("/posts", postsRouter);
app.use("/users", usersRouter);
// app.use("/", [usersRouter]);

// app.get("/", (req, res) => {
//   res.send("Hi");
// });

app.listen(port, async () => {
  console.log(port, "포트로 서버가 열렸습니다.");
  await sequelize.authenticate();
  console.log("db authenticated!");
});
