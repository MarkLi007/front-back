const Proposal = require('../models/Proposal');

const createProposal = async (parameter_name, new_value) => {
  try {
    const proposal = await Proposal.create({ parameter_name, new_value });
    return proposal;
  } catch (error) {
    console.error('Error creating proposal:', error);
    throw error;
  }
};

const voteOnProposal = async (proposalId, vote) => {
  try {
    const proposal = await Proposal.findByPk(proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }

    if (vote === 'for') {
      proposal.votes_for += 1;
    } else if (vote === 'against') {
      proposal.votes_against += 1;
    } else {
      throw new Error('Invalid vote');
    }

    await proposal.save();
    return proposal;
  } catch (error) {
    console.error('Error voting on proposal:', error);
    throw error;
  }
};

const executeProposal = async (proposalId) => {
  try {
    const proposal = await Proposal.findByPk(proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }

    if (proposal.executed) {
      throw new Error('Proposal already executed');
    }
    const totalVotes = proposal.votes_for + proposal.votes_against;
    if(totalVotes === 0){
      throw new Error('No votes yet');
    }

    const passThreshold = 0.5; 
    const pass = proposal.votes_for / totalVotes >= passThreshold;

    if (pass) {
      
      proposal.executed = true;
      await proposal.save();
      return proposal;
    } else {
      throw new Error('Proposal did not pass');
    }
  } catch (error) {
    console.error('Error executing proposal:', error);
    throw error;
  }
};

module.exports = { createProposal, voteOnProposal, executeProposal };