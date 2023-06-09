const Joi = require("joi");

// 회원가입 유효성 검사
const signupValidation = Joi.object({
  nickname: Joi.string().alphanum().not("").required(),
  password: Joi.string().min(6).not("").required(),
  confirm: Joi.equal(Joi.ref("password")).required().messages({
    "any.only": "비밀번호가 일치하지 않습니다.",
  }),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
});

// 게시글 작성 유효성 검사
const postCreateValidation = Joi.object({
  title: Joi.string().not("").required(),
  content: Joi.string().not("").required(),
  userId: Joi.forbidden(),
});

// 게시글 수정 유효성 검사
const postUpdateValidation = Joi.object({
  title: Joi.string().optional().not(""),
  content: Joi.string().optional().not(""),
  userId: Joi.forbidden(),
});

// 댓글 작성 유효성 검사
const commentCreateValidation = Joi.object({
  comment: Joi.string().not("").required(),
  userId: Joi.number().required(),
  postId: Joi.forbidden(),
});

// 댓글 수정 유효성 검사
const commentUpdateValidation = Joi.object({
  comment: Joi.string().not("").required(),
});

module.exports = {
  signupValidation,
  postCreateValidation,
  postUpdateValidation,
  commentCreateValidation,
  commentUpdateValidation,
};
