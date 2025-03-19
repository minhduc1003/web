const express = require("express");
const compression = require("compression");
const path = require("path");

const app = express();
const PORT = process.env.PORT_GAME2 || 9000;

// Bật Gzip để nén dữ liệu
app.use(compression());

// Phục vụ file tĩnh với header chính xác
app.use(
  express.static(path.join(__dirname, "game2"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".gz")) {
        res.setHeader("Content-Encoding", "gzip");

        // Kiểm tra đuôi file và đặt Content-Type đúng
        if (filePath.endsWith(".wasm.gz")) {
          res.setHeader("Content-Type", "application/wasm");
        } else if (filePath.endsWith(".js.gz")) {
          res.setHeader("Content-Type", "application/javascript");
        } else if (filePath.endsWith(".data.gz")) {
          res.setHeader("Content-Type", "application/octet-stream");
        }
      }
    },
  })
);

app.get("/question.json", (req, res) => {
  res.setHeader("Content-Type", "database");
  res.sendFile(path.join(__dirname, "question.json"));
});

// Mở server
app.listen(PORT, () => {
  console.log(`Server chạy tại: http://localhost:${PORT}`);
});
