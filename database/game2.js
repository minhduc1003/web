const express = require("express");
const compression = require("compression");
const path = require("path");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT_GAME12 || 9000;

// Bật Gzip để nén dữ liệu
app.use(compression());
mongoose
  .connect(
    "mongodb+srv://vuminhduc231003:duc123434@cluster0.ldosk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log(" Kết nối MongoDB thành công"))
  .catch((err) => console.error(" Lỗi kết nối MongoDB:", err));

// Phục vụ file tĩnh với header chính xác
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  level: String,
  game: String,
});
const User = mongoose.model("User", userSchema);
app.use("/:id", async (req, res, next) => {
  const gameId = req.params.id;
  let user = null;

  // Check if gameId is a valid MongoDB ObjectId
  if (mongoose.Types.ObjectId.isValid(gameId)) {
    try {
      user = await User.findById(gameId);
      if (user) {
        // Store user data in a cookie instead of res.locals
        const userData = {
          id: user._id,
          name: user.name,
          email: user.email,
          level: user.level,
          game: user.game,
        };

        // Set user data in res.locals to make it available for rendering
        res.locals.userData = userData;

        // Send user data as JSON in a script tag that the client can use
        res.cookie("level", user.level, {
          httpOnly: false, // Allow JavaScript access
        });
        res.cookie("game", user.game, {
          httpOnly: false, // Allow JavaScript access
        });
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  }

  // Choose directory based on gameId

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
  })(req, res, next);
});

app.get("/question.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.sendFile(path.join(__dirname, "public", "question.json"));
});

// Mở server
app.listen(PORT, () => {
  console.log(`Server chạy tại: http://localhost:${PORT}`);
});
