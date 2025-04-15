const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { create } = require("ipfs-http-client"); // IPFS 客户端
const fs = require("fs");
const diffRouter = require("./routes/diff");
const commentRouter = require("./routes/comment");
const mysql = require("mysql2");
const cors = require("cors");
const { parsePdf } = require("./parsePdf"); // 从 parsePdf.js 中导入解析 PDF 的函数
const { diffWords } = require("diff"); // 用于文本对比

// Configure IPFS client
const ipfsClient = create({ url: "http://47.79.16.191:5001/api/v0" });

const app = express();
app.use(bodyParser.json());
app.use(cors());

// MySQL 数据库连接配置
const db = mysql.createConnection({
  host: "localhost",
  user: "root", 
  password: "123456", 
  database: "paper_system"
});

// 下载文件并保存到本地临时目录
const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

// 下载文件并保存到本地临时目录
const downloadFromIPFS = async (ipfsHash, tempFilePath) => {
  // 确保 ipfsHash 是有效的哈希字符串（例如一个有效的 IPFS 哈希值）
  if (!ipfsHash) {
    throw new Error("Invalid IPFS hash");
  }

  try {
    const fileStream = ipfsClient.cat(ipfsHash); // 从IPFS获取文件流
    const buffer = await streamToBuffer(fileStream); // 转换流为Buffer
    fs.writeFileSync(tempFilePath, buffer); // 将文件保存到临时文件夹
  } catch (error) {
    console.error("Error downloading from IPFS:", error);
    throw new Error("Failed to download file from IPFS");
  }
};

// 对比两个文本
const diffText = (oldText, newText) => {
  return diffWords(oldText, newText);  // 使用 diff 库对比文本
};

// PDF 对比功能
app.get("/api/diff", async (req, res) => {
  const { paperId, verA, verB } = req.query;

  if (!paperId || verA === undefined || verB === undefined) {
    return res.status(400).json({ error: "Missing query params" });
  }

  try {
    // 假设你在 IPFS 上存储的文件哈希是类似这样的结构：'paperId/version'
    const ipfsHashA = `${paperId}/${verA}`;
    const ipfsHashB = `${paperId}/${verB}`;

    // 临时文件路径
    const tempFileA = path.join(__dirname, 'temp', `tempA_${verA}.pdf`);
    const tempFileB = path.join(__dirname, 'temp', `tempB_${verB}.pdf`);

    // 下载 PDF 文件
    await downloadFromIPFS(ipfsHashA, tempFileA);
    await downloadFromIPFS(ipfsHashB, tempFileB);

    // 解析 PDF 文件
    const textA = await parsePdf(tempFileA);
    const textB = await parsePdf(tempFileB);

    // 比较文本
    const diff = diffText(textA, textB);

    // 删除临时文件
    fs.unlinkSync(tempFileA);
    fs.unlinkSync(tempFileB);

    // 返回差异
    res.json({
      paperId,
      verA,
      verB,
      diff,
    });
  } catch (error) {
    console.error("Error processing diff:", error);
    res.status(500).json({ error: "Failed to fetch or process PDFs" });
  }
});

// 挂载评论路由
app.use("/api/comments", commentRouter);
app.use("/api", diffRouter);

// 启动服务器
const port = 3002;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
