require("dotenv").config();
const express = require("express");

const router = express.Router();
const { signupValidation } = require("../validations");
const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { JWT_SECRET_KEY } = process.env;

// 유저 정보 확인
router.get("/users", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });
    res.json(users);
  } catch (err) {}
});

// 회원가입
router.post("/signup", async (req, res) => {
  try {
    const { nickname, password, email } = await signupValidation.validateAsync(
      req.body
    );
    // 해커가 암호화된 비밀번호를 깨는데 걸리는 시간 12
    // salt round 12는 암호화 된 비밀번호를 더 독특하게 만들어 공격의 비용요소를 증가시키는 기술
    const hashedPassword = await bcrypt.hash(password, 12);
    // db에 생성하는 정보
    const user = await User.create({
      nickname,
      password: hashedPassword,
      email,
    });
    res.json(user);
  } catch (err) {
    if (err.isJoi) {
      return res.status(422).json({ message: err.details[0].message });
    }
    res.status(500).json({ message: err.message });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 비교를 해야되니 유저의 정보 가져오기
    const user = await User.findOne({ email });
    // bcrypt로 암호화된 비밀번호를 비교해야됨
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    // 입력된 정보가 틀렸을때
    if (!user || !isPasswordCorrect) {
      return res
        .status(400)
        .json({ message: "이메일 또는 비밀번호가 틀렸습니다." });
    }

    // 입력된 정보가 맞을때 token을 발급하는 응답 보내주기
    res.json({ token: jwt.sign({ email }, JWT_SECRET_KEY) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// module의 형태로 내보냄
module.exports = router;
