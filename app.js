// express 인스턴스 생성 및 app에 저장
const express = require("express");
const app = express();
const path = require("path");

const authRouter = require("./routes/auth");
const postsRouter = require("./routes/posts");
const commentRouter = require("./routes/comments");
const usersRouter = require("./routes/users");

const { sequelize } = require("./models");

// 1004번 포트로 지정
const port = 1004;

// view engine 템플릿 사용 명시
app.set("views", "./views");
// 화면 엔진은 ejs로 설정한다.
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.static(path.join(__dirname, "static")));

app.use(authRouter);
app.use("/posts", postsRouter);
app.use("/comments", commentRouter);
app.use("/users", usersRouter);
// app.use("/", [usersRouter]);

// index.ejs 실행
app.get("/", (req, res) => {
  res.render("index");
});

app.listen(port, async () => {
  console.log(port, "포트로 서버가 열렸습니다.");
  await sequelize.authenticate();
  console.log("db authenticated!");
});
