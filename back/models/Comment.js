const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('mysql://username:password@localhost:3306/database_name');

// 定义评论模型
const Comment = sequelize.define('Comment', {
  paperId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userAddr: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'comments',
      key: 'id',
    },
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  reports: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

// 定义自关联，确保能通过 include 获取回复数据
Comment.hasMany(Comment, { as: 'replies', foreignKey: 'parentId' });
Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parentId' });

module.exports = Comment;
