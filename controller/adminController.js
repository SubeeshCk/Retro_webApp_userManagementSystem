const User = require("../model/userModel");

const bcrypt = require("bcrypt");
const randomstring = require("randomstring");
const nodeMailer = require("nodemailer");

//method for secure passsword
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error);
  }
};

//method for verify mail
const sendVerifyMail = async (name, email, password, user_id) => {
  try {
    const transporter = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      requireTLS: true,
      auth: {
        user: "subeeshck3@gmail.com",
        pass: "twga dqiz nkcd eome",
      },
    });

    const mailOptions = {
      from: "subeeshck3@gmail.com",
      to: email,
      subject: "Admin added you as user,please verify your email",
      html:
        "<p> Hi" +
        name +
        ',Please click here to verify your mail <a href="http://127.0.0.1:3000/verify?id=' +
        user_id +
        '">verify</a></p> <br><br> <b>Email-</b>' +
        email +
        "<br><b>Password-</b>" +
        password +
        "",
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email has been send" + info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

//method for load loginpage
const loadLogin = async (req, res) => {
  try {
    res.render("login", { title: "Admin login" });
  } catch (error) {
    console.log(error.message);
  }
};

//method for login verification
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const adminData = await User.findOne({ email: email });

    if (adminData) {
      const passwordMatch = await bcrypt.compare(password, adminData.password);

      if (passwordMatch) {
        if (adminData.is_admin === 0) {
          res.render("login", {
            title: "Admin login",
            loginfailMessage: "Login failed, Invalid user name or password",
          });
        } else {
          req.session.user_id = adminData._id;
          res.redirect("/admin/home");
        }
      } else {
        res.render("login", {
          title: "Admin login",
          loginfailMessage: "Login failed, Invalid user name or password",
        });
      }
    } else {
      res.render("login", {
        title: "Admin login",
        loginfailMessage: "Login failed, Invalid user name or password",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//method for load home page
const loadHome = async (req, res) => {
  try {
    const adminData = await User.findOne({ _id: req.session.user_id });
    res.render("home", { title: "Home", admin: adminData });
  } catch (error) {
    console.log(error.message);
  }
};

//method for for admin logout
const adminLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.render("login", {
      title: "Admin login",
      logoutMessage: "Logout successfully...",
    });
  } catch (error) {
    console.log(error.message);
  }
};

//method for load dashboard
const loadDashboard = async (req, res) => {
  try {
    const userData = await User.find({ is_admin: 0 });
    res.render("dashboard", { users: userData, title: "Dashboard" });
  } catch (error) {
    console.log(error.message);
  }
};

//method for adding new user
const loadNewUer = async (req, res) => {
  try {
    res.render("new-user", { title: "New user" });
  } catch (error) {
    console.log(error.message);
  }
};

//method for add new user
const addNewUser = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const mobile = req.body.mobile;
    const image = req.file.filename;
    const password = randomstring.generate(8);

    const hashedPassword = await securePassword(password);

    const newUser = new User({
      name: name,
      email: email,
      mobile: mobile,
      image: image,
      password: hashedPassword,
      is_admin: 0,
    });

    const userData = await newUser.save();

    if (userData) {
      sendVerifyMail(name, email, password, userData._id);
      res.redirect("/admin/dashboard");
    } else {
      res.render("new-user", { failMsg: "Something went wrong..." });
    }
  } catch (error) {
    if (error.code === 11000 && error.keyPattern.email) {
      return res
        .status(400)
        .render("new-user", {
          failMsg: "Email already exists",
          title: "New user",
        });
    } else if (error.code === 11000 && error.keyPattern.mobile) {
      return res
        .status(400)
        .render("new-user", {
          failMsg: "Mobile number already exists",
          title: "New user",
        });
    } else {
      console.log(error);
      return res
        .status(500)
        .render("new-user", {
          failMsg: "Sign up failed...",
          title: "New user",
        });
    }
  }
};

//method for load edit-user page
const loadEditUser = async (req, res) => {
  try {
    const id = req.query.id;

    const userData = await User.findById({ _id: id });
    if (userData) {
      res.render("edit-user", { title: "Edit user", user: userData });
    } else {
      res.redirect("/admin/dashboard");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//method for updating edited user data
const updateEditedData = async (req, res) => {
  try {
    const userData = await User.findOneAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          mobile: req.body.mobile,
        },
      }
    );
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error.message);
  }
};

//method for delete user

const deleteUser = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findOneAndDelete({ _id: id });
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadLogin,
  verifyLogin,
  loadHome,
  adminLogout,
  loadDashboard,
  loadNewUer,
  addNewUser,
  loadEditUser,
  updateEditedData,
  deleteUser,
};
