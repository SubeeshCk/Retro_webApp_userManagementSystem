const express = require("express");
const user_route = express();

const bodyParser = require("body-parser");

const session = require("express-session");
const config = require("../config/config");
user_route.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
  })
);

const auth = require("../middlewares/auth");

user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/userImages"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const upload = multer({ storage: storage });

user_route.set("view engine", "ejs");
user_route.set("views", "./views/user");

const userController = require("../controller/userController");

user_route.get("/signup", auth.islogout, userController.loadUser);

user_route.post("/signup", upload.single("image"), userController.insertUser);

user_route.get("/verify", userController.VerifyMail);

user_route.get("/", auth.islogout, userController.loadLogin);
user_route.get("/login", auth.islogout, userController.loadLogin);
user_route.post("/login", userController.verifyLogin);

user_route.get("/home", auth.islogin, userController.loadHome);

user_route.get("/logout", auth.islogin, userController.userLogout);
user_route.get("/forgot",auth.islogout,userController.forgotLoad);
user_route.post("/forgot",userController.forgotVerify);
user_route.get("/forgot-password",auth.islogout,userController.forgetPassLoad);
user_route.post("/forgot-password",userController.resetPassword);

user_route.get("/mailVerification", userController.loadEmailVerification);
user_route.post("/mailVerification", userController.sendVerificationLink);

module.exports = user_route;
