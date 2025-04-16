const Paper = require('../models/Paper');

const getCitations = async (paperId) => {
  try {
    const paper = await Paper.findByPk(paperId);
    if (!paper) {
      return null;
    }
    return paper.citations;
  } catch (error) {
    console.error('Error getting citations:', error);
    throw error;
  }
};

const getInfluenceScore = async (paperId) => {
  try {
    const paper = await Paper.findByPk(paperId);
    if (!paper) {
      return null;
    }
    return paper.influence_score;
  } catch (error) {
    console.error('Error getting influence score:', error);
    throw error;
  }
};

const updatePaper = async (paperData) => {
    try {
      const paper = await Paper.findByPk(paperData.id);
      if (!paper) {
        return null;
      }
        await paper.update(paperData)
        return paper;
    } catch (error) {
        console.error('Error updating paper:', error);
        throw error;
    }
};

module.exports = {
  getCitations,
  getInfluenceScore,
    updatePaper
};