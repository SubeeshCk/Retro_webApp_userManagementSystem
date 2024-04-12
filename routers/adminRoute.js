const express = require("express");
const admin_route = express();

const bodyParser = require("body-parser");

const auth = require("../middlewares/adminAuth");

const session = require("express-session");
const config = require("../config/config");
admin_route.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
  })
);

admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));
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

admin_route.set("view engine", "ejs");
admin_route.set("views", "./views/admin");

const adminController = require("../controller/adminController");

admin_route.get("/", auth.islogout, adminController.loadLogin);
admin_route.post("/", adminController.verifyLogin);
admin_route.get("/home", auth.islogin, adminController.loadHome);
admin_route.get("/logout", auth.islogin, adminController.adminLogout);
admin_route.get("/dashboard", auth.islogin, adminController.loadDashboard);
admin_route.get("/new-user", auth.islogin, adminController.loadNewUer);
admin_route.post(
  "/new-user",
  upload.single("image"),
  adminController.addNewUser
);
admin_route.get("/edit-user", auth.islogin, adminController.loadEditUser);
admin_route.post("/edit-user", adminController.updateEditedData);
admin_route.get("/delete-user", auth.islogin, adminController.deleteUser);
admin_route.get("*", function (req, res) {
  res.redirect("/admin");
});

module.exports = admin_route;
