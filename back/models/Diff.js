const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// 创建差异计算模型
const Diff = sequelize.define('Diff', {
  paperId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  verA: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  verB: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  differences: {
    type: DataTypes.JSON,
    allowNull: false,
  },
});

module.exports = Diff;
