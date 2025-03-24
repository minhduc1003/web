//docker build -t my-multi-server-app .
//docker run -p 4000:4000 -p 9000:9000 -p 3000:3000 -p 8000:8000 my-multi-server-app
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // Thư viện mã hóa mật khẩu
const path = require("path");
const jwt = require("jsonwebtoken");
const app = express();
const cors = require("cors");
// Middleware
app.use(express.json()); // Xử lý dữ liệu JSON
app.use(express.urlencoded({ extended: true })); // Xử lý dữ liệu form-urlencoded
app.use(express.static("public")); // Cung cấp file tĩnh từ thư mục 'public'
// genarate token
const genarateToken = (id) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET || "secretToken");
};
// Kết nối MongoDB
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
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

// Tạo Schema và Model
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  level: String,
  game: String,
  gameData: {
    type: Array,
    default: [
      // Game 1
      { level: 1, game: 1, score: 0, status: false, isUnlocked: true }, // First level is unlocked
      { level: 2, game: 1, score: 0, status: false, isUnlocked: false },
      { level: 3, game: 1, score: 0, status: false, isUnlocked: false },
      { level: 4, game: 1, score: 0, status: false, isUnlocked: false },
      { level: 5, game: 1, score: 0, status: false, isUnlocked: false },
      { level: 6, game: 1, score: 0, status: false, isUnlocked: false },
      { level: 7, game: 1, score: 0, status: false, isUnlocked: false },
      { level: 8, game: 1, score: 0, status: false, isUnlocked: false },
      { level: 9, game: 1, score: 0, status: false, isUnlocked: false },
      // Game 2
      { level: 1, game: 2, score: 0, status: false, isUnlocked: false }, // Unlocked after level 1 game 1
      { level: 2, game: 2, score: 0, status: false, isUnlocked: false },
      { level: 3, game: 2, score: 0, status: false, isUnlocked: false },
      { level: 4, game: 2, score: 0, status: false, isUnlocked: false },
      { level: 5, game: 2, score: 0, status: false, isUnlocked: false },
      { level: 6, game: 2, score: 0, status: false, isUnlocked: false },
      { level: 7, game: 2, score: 0, status: false, isUnlocked: false },
      { level: 8, game: 2, score: 0, status: false, isUnlocked: false },
      { level: 9, game: 2, score: 0, status: false, isUnlocked: false },
      // Game 3
      { level: 1, game: 3, score: 0, status: false, isUnlocked: false }, // Unlocked after level 1 game 2
      { level: 2, game: 3, score: 0, status: false, isUnlocked: false },
      { level: 3, game: 3, score: 0, status: false, isUnlocked: false },
      { level: 4, game: 3, score: 0, status: false, isUnlocked: false },
      { level: 5, game: 3, score: 0, status: false, isUnlocked: false },
      { level: 6, game: 3, score: 0, status: false, isUnlocked: false },
      { level: 7, game: 3, score: 0, status: false, isUnlocked: false },
      { level: 8, game: 3, score: 0, status: false, isUnlocked: false },
      { level: 9, game: 3, score: 0, status: false, isUnlocked: false },
    ],
  },
  score: { type: Number, default: 0 },
});

const User = mongoose.model("User", userSchema);

// Route đăng ký tài khoản
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email đã tồn tại!" });
    }

    // Lưu người dùng mới vào MongoDB mà không mã hóa mật khẩu
    const user = await User.create({ name, email, password });
    const token = genarateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: token,
      success: true,
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ success: false, message: "Có lỗi xảy ra!" });
  }
});

// Route đăng nhập
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm người dùng theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Tài khoản không tồn tại!" });
    }

    // So sánh trực tiếp mật khẩu nhập vào với mật khẩu trong database
    if (user.password !== password) {
      return res.json({ success: false, message: "Mật khẩu không đúng!" });
    }
    const token = genarateToken(user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: token,
      success: true,
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ success: false, message: "Có lỗi xảy ra!" });
  }
});

// Authentication middleware
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const verified = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || "secretToken"
    );
    const user = await User.findById(verified.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Please login again" });
  }
};
app.post("/playing", protect, async (req, res) => {
  try {
    const { level, game } = req.body;
    await User.findByIdAndUpdate(req.user._id, { level, game });
    res.json({ success: true });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ success: false, message: "Có lỗi xảy ra!" });
  }
});
app.get("/updateScore/:userId/:level/:game/:score", async (req, res) => {
  try {
    const { level, game, score, userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const gameIndex = user.gameData.findIndex(
      (item) => item.level === parseInt(level) && item.game === parseInt(game)
    );

    if (gameIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Game level not found",
      });
    }

    user.gameData[gameIndex].score = parseInt(score);
    user.gameData[gameIndex].status = true;
    if (parseInt(level) < 9 && parseInt(level) >= 1) {
      const nextLevelIndex = user.gameData.findIndex(
        (item) =>
          item.level === parseInt(level) + 1 && item.game === parseInt(game)
      );
      console.log(game);
      if (parseInt(game) === 3) {
        const nextLevel = parseInt(level) + 1;
        if (nextLevel <= 9) {
          const nextLevelFirstGameIndex = user.gameData.findIndex(
            (item) => item.level === nextLevel && item.game === 1
          );
          if (nextLevelFirstGameIndex !== -1) {
            user.gameData[nextLevelFirstGameIndex].isUnlocked = true;
          }
        }
      }
    }

    if (parseInt(game) < 3) {
      const nextGameIndex = user.gameData.findIndex(
        (item) =>
          item.level === parseInt(level) && item.game === parseInt(game) + 1
      );

      if (nextGameIndex !== -1) {
        user.gameData[nextGameIndex].isUnlocked = true;
      }
    }
    let totalScore = 0;
    for (const gameItem of user.gameData) {
      totalScore += gameItem.score;
    }
    user.score = totalScore;
    user.markModified("gameData");

    await user.save();

    res.json({
      success: true,
      message: "Score updated successfully",
      updatedGame: user.gameData[gameIndex],
      gameData: user.gameData,
    });
  } catch (error) {
    console.error("Update score error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
app.get("/getUser", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      const { _id, name, email, gameData } = user;
      res.json({
        _id,
        name,
        email,
        gameData,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// Route trang chủ
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/log_in.html"));
});

app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Khởi động server
const PORT = process.env.PORT_WEB || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});
