const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = process.env;

const { User } = require("../models");

const authMiddleware = async (req, res, next) => {
  // key 값 가져오기
  const { authorization = "" } = req.headers;

  // 배열에 이렇게 담겨있음['Bearer', '<token>']
  const [tokenType, token] = authorization.split(" ");

  // token이 제대로 들어왔는지 확인해주기
  const isTokenValid = token && tokenType === "Bearer"; // true or flase

  // token이 유효하지 않을때
  if (!isTokenValid) {
    return res.status(401).json({
      message: "로그인 후 이용가능한 기능입니다.",
    });
  }
  // token이 유효할 때 db에서 유저를 찾아보기
  try {
    const { email } = jwt.verify(token, JWT_SECRET_KEY);

    // 위의 email 을 통해 db에서 user의 정보를 가져온다.
    const user = await User.findOne({ where: { email } });

    res.locals.currentUser = user;
    next();
  } catch (err) {
    res.status(401).json({
      message: "로그인 후 이용 가능한 기능입니다.",
    });
  }
};

module.exports = authMiddleware;
