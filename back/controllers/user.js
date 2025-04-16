const User = require('../models/User');

const getNickname = async (walletAddress) => {
  try {
    const user = await User.findOne({ where: { wallet_address: walletAddress } });
    return user ? user.nickname : null;
  } catch (error) {
    console.error('Error getting nickname:', error);
    throw error;
  }
};

const setNickname = async (walletAddress, nickname) => {
  try {
    const user = await User.findOne({ where: { wallet_address: walletAddress } });
    if (user) {
      user.nickname = nickname;
      await user.save();
      return user;
    } else {
      const newUser = await User.create({ wallet_address: walletAddress, nickname });
      return newUser;
    }
  } catch (error) {
    console.error('Error setting nickname:', error);
    throw error;
  }
};

module.exports = {
  getNickname,
  setNickname,
};