// diffService.js
const { diffWords } = require("diff");

/**
 * 对比 oldText 与 newText 的不同
 * @param {string} oldText
 * @param {string} newText
 * @returns {Array} diff数组, 形如 [ {value, added, removed}, ... ]
 */
function diffText(oldText, newText) {
  // 这里以词级对比(diffWords)为例，也可用 diffLines/diffChars 等
  const result = diffWords(oldText, newText);
  return result; 
  // 例如返回:
  // [
  //   {value:'some text', added:false, removed:false},
  //   {value:' new words', added:true, removed:false},
  //   ...
  // ]
}

module.exports = {
  diffText,
};
