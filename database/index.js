require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // Thư viện mã hóa mật khẩu
const path = require("path");
const jwt = require("jsonwebtoken");
const app = express();

// Middleware
app.use(express.json()); // Xử lý dữ liệu JSON
app.use(express.urlencoded({ extended: true })); // Xử lý dữ liệu form-urlencoded
app.use(express.static("public")); // Cung cấp file tĩnh từ thư mục 'public'
// genarate token
const genarateToken = (id) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET || "secretToken");
};
// Kết nối MongoDB
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
app.get("/getUser", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      const { _id, name, email } = user;
      res.json({
        _id,
        name,
        email,
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
