const express = require("express");
const router = express.Router();

const {
  postCreateValidation,
  postUpdateValidation,
} = require("../validations");

const { Post, User, Like, Sequelize } = require("../models");
const authMiddleware = require("../middleware/auth");

// 게시글 조회
router.get("/", async (req, res) => {
  try {
    const posts = await Post.findAll({
      attributes: [
        "id",
        "title",
        "content",
        [Sequelize.fn("count", Sequelize.col("likes.id")), "numOfLikes"],
      ],
      include: [
        { model: User, as: "user", attributes: ["nickname"] },
        {
          model: Like,
          as: "likes",
          attributes: [],
        },
      ],
      group: ["post.id"],
      order: [[Sequelize.literal("numOfLikes"), "DESC"]],
      // ASC 작은거->많은거 정렬, DESC 많은거->작은거 정렬
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 게시글 상세조회
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findByPk(id, {
      include: [{ model: User, as: "user", attributes: ["nickname"] }],
      attributes: { exclude: ["userId"] },
    });

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 게시글 작성
router.post("/", authMiddleware, async (req, res) => {
  const { currentUser } = res.locals;
  const userId = currentUser.id;
  try {
    const { title, content } = await postCreateValidation.validateAsync(
      req.body
    );
    // db에 생성하는 정보
    const post = await Post.create({
      title,
      content,
      userId,
    });
    res.json(post);
  } catch (err) {
    if (err.isJoi) {
      return res.status(422).json({ message: err.details[0].message });
    }
    res.status(500).json({ message: err.message });
  }
});

// 게시글 수정
router.patch("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    // title나 content 중 보내는 것만 수정
    const fieldsToBeUpdated = await postUpdateValidation.validateAsync(
      req.body
    );
    const updatedPost = await Post.update(fieldsToBeUpdated, {
      where: { id },
    });
    res.json(updatedPost);
  } catch (err) {
    if (err.isJoi) {
      return res.status(422).json({ message: err.details[0].message });
    }
    res.status(500).json({ message: err.message });
  }
});

// 게시글 삭제
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.destroy({ where: { id } });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 게시글 좋아요
router.post("/:id/like", authMiddleware, async (req, res) => {
  const { id: postId } = req.params;
  const { currentUser } = res.locals;
  const userId = currentUser.id;

  try {
    const like = await Like.findOne({
      where: {
        userId,
        postId,
      },
    });

    const isLikedAlready = !!like;

    if (isLikedAlready) {
      // 취소
      const deletedLike = await Like.destroy({
        where: {
          userId,
          postId,
        },
      });
      res.json(deletedLike);
    } else {
      const postlike = await Like.create({
        userId,
        postId,
      });

      res.json(postlike);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
