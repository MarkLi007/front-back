const Diff = require('../models/Diff');

const getDiff = async (paperId, verA, verB) => {
  try {
    const diff = await Diff.findOne({
      where: {
        paper_id: paperId,
        verA: verA,
        verB: verB,
      },
    });

    if (diff) {
      return diff.diff;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting diff:', error);
    throw error;
  }
};

module.exports = { getDiff };