const express = require("express");

const router = express.Router();
const { signupValidation } = require("../validations");
const { User } = require("../models");
const bcrypt = require("bcrypt");

router.get("/users", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });
    res.json(users);
  } catch (err) {}
});

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

// module의 형태로 내보냄
module.exports = router;
