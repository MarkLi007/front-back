const pdfParse = require("pdf-parse");

// 解析PDF文件并提取文本
const parsePdf = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  return pdfParse(dataBuffer)
    .then((data) => data.text)
    .catch((error) => {
      console.error("Error parsing PDF:", error);
      throw new Error("Failed to parse PDF");
    });
};

module.exports = { parsePdf };
