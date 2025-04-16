const Comment = require('../models/Comment');

const getComments = async (paperId) => {
  try {
    const comments = await Comment.findAll({ where: { paper_id: paperId } });
    return comments;
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
};

const addComment = async (paperId, userAddress, commentContent) => {
  try {
    const newComment = await Comment.create({
      paper_id: paperId,
      user_address: userAddress,
      comment: commentContent,
    });
    return newComment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

const deleteComment = async (commentId) => {
  try {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return false;
    }
    await comment.destroy();
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

module.exports = {
  getComments,
  addComment,
  deleteComment,
};