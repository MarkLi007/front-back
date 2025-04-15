const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");

// 创建评论
router.post("/", async (req, res) => {
  const { paperId, userAddr, content, parentId } = req.body;
  if (!paperId || !userAddr || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const newComment = await Comment.create({
      paperId,
      userAddr,
      content,
      parentId,  // 若为回复，则 parentId 有值
    });
    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

// 获取所有评论及其回复（根据 paperId 过滤）
router.get("/", async (req, res) => {
  const { paperId } = req.query;
  if (!paperId) {
    return res.status(400).json({ error: "paperId is required" });
  }
  try {
    const comments = await Comment.findAll({
      where: { 
        paperId,
        parentId: null, // 获取顶级评论
      },
      include: [{
        model: Comment,
        as: 'replies',
        required: false
      }]
    });
    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// 点赞评论
router.post("/:id/like", async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    comment.likes += 1;
    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    console.error("Error liking comment:", error);
    res.status(500).json({ error: "Failed to like comment" });
  }
});

// 举报评论
router.post("/:id/report", async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    comment.reports += 1;
    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    console.error("Error reporting comment:", error);
    res.status(500).json({ error: "Failed to report comment" });
  }
});

module.exports = router;
