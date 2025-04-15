const { Sequelize } = require('sequelize');

// 创建数据库连接
const sequelize = new Sequelize('paper_diff_db', 'root', '123456', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,  // 禁用查询日志，可以根据需要开启
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to MySQL has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to MySQL:', error);
  }
};

module.exports = { sequelize, connectDB };
