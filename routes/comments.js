const express = require("express");
const router = express.Router();

const { Comment, Post } = require("../models");
const {
  commentCreateValidation,
  commentUpdateValidation,
} = require("../validations");

// 댓글 조회
router.get("/", async (req, res) => {
  try {
    const comments = await Comment.findAll();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 한 게시글에 담긴 댓글들 불러오기
router.get("/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findByPk(postId);
    const postComments = await post.getComments();
    res.json(postComments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 댓글 작성
router.post("/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    const { comment, userId } = await commentCreateValidation.validateAsync(
      req.body
    );
    // db에 생성되는 정보
    const comments = await Comment.create({
      comment,
      userId,
      postId,
    });
    res.json(comments);
  } catch (err) {
    if (err.isJoi) {
      return res.status(422).json({ message: err.details[0].message });
    }
    res.status(500).json({ message: err.message });
  }
});

// 댓글 수정
router.patch("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 입력된 값 유효성 검사
    const fieldsToUpdate = await commentUpdateValidation.validateAsync(
      req.body
    );
    // db에 수정할 정보
    const updatedComment = await Comment.update(fieldsToUpdate, {
      where: { id },
    });
    res.json(updatedComment);
  } catch (err) {
    if (err.isJoi) {
      return res.status(422).json({ message: err.details[0].message });
    }
    res.status(500).json({ message: err.message });
  }
});

// 댓글 삭제
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deleteComment = await Comment.destroy({ where: { id } });
    res.json(deleteComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
