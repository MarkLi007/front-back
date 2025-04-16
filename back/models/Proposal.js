const { DataTypes } = require('sequelize');
const { db } = require('../config/db');

const Proposal = db.define('Proposal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  parameter_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  new_value: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  votes_for: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  votes_against: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  executed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
    tableName: 'proposals',
    timestamps: false,
});

module.exports = Proposal;