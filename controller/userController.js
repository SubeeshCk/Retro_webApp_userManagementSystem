const User = require("../model/userModel");

const bcrypt = require("bcrypt");
const nodeMailer = require("nodemailer");
const userRoute = require("../routers/userRoute");
const randomstring = require("randomstring");
const config = require("../config/config");

//USER SIGNUP METHODS
//method to secure password
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error);
  }
};

//method for verify mail
const sendVerifyMail = async (name, email, user_id) => {
  try {
    const transporter = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });

    const mailOptions = {
      from: config.emailUser,
      to: email,
      subject: "Verification mail",
      html:
        "<p> Hi" +
        name +
        ',Please click here to verify your mail <a href="http://127.0.0.1:3000/verify?id=' +
        user_id +
        '">verify</a></p>',
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

//method for send reset password mail
const sendResetPassMail = async (name, email, token) => {
  try {
    const transporter = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });

    const mailOptions = {
      from: config.emailUser,
      to: email,
      subject: "For reset password",
      html:
        "<p> Hi" +
        name +
        ',Please click here to verify your mail <a href="http://127.0.0.1:3000/forgot-password?token=' +
        token +
        '">Reset password</a></p>',
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

//method to load user
const loadUser = async (req, res) => {
  try {
    res.render("signup", { title: "signup" });
  } catch (error) {
    console.log(error);
  }
};

//method to insert user
const insertUser = async (req, res) => {
  try {
    console.log(req.body); //for test purpose

    // Check if a file was uploaded
    if (!req.file || !req.file.filename) {
      return res
        .status(400)
        .render("signup", { failMsg: "No file uploaded", title: "signup" });
    }

    const { name, email, mobile, password, confirmPassword } = req.body;

    // Validate input
    if (!name || !email || !mobile || !password || !confirmPassword) {
      return res.status(400).render("signup", {
        failMsg: "All fields are required",
        title: "signup",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).render("signup", {
        failMsg: "Passwords do not match",
        title: "signup",
      });
    }

    // Create user
    const sPassword = await securePassword(req.body.password);

    const newUser = new User({
      name: name,
      email: email,
      mobile: mobile,
      image: req.file.filename,
      password: sPassword,
      is_admin: 0,
    });

    const userData = await newUser.save();

    if (userData) {
      sendVerifyMail(req.body.name, req.body.email, userData._id);

      return res.render("signup", {
        successMsg: "You are Signed up successfully, please verify your mail",
        title: "signup",
      });
    } else {
      return res
        .status(500)
        .render("signup", { failMsg: "Sign up failed...", title: "signup" });
    }
  } catch (error) {
    if (error.code === 11000 && error.keyPattern.email) {
      return res
        .status(400)
        .render("signup", { failMsg: "Email already exists", title: "signup" });
    } else if (error.code === 11000 && error.keyPattern.mobile) {
      return res
        .status(400)
        .render("signup", { failMsg: "Mobile number already exists" });
    } else {
      return res
        .status(500)
        .render("signup", { failMsg: "Sign up failed...", title: "signup" });
    }
  }
};

//method for verify mail
const VerifyMail = async (req, res) => {
  try {
    const updateInfo = await User.updateOne(
      { _id: req.query.id },
      { $set: { is_verified: 1 } }
    );
    console.log(updateInfo);

    res.render("signup", {
      successMsg:
        "Your email is verified,please login using Email and Password",
      title: "signup",
    });
  } catch (error) {
    console.log(error.message);
  }
};

//USER LOG IN METHODS
//method for load login page
const loadLogin = async (req, res) => {
  try {
    res.render("login", { title: "login" });
  } catch (error) {
    console.log(error);
  }
};

//method for verify login data
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const loginData = await User.findOne({ email: email });

    if (loginData) {
      const passMatch = await bcrypt.compare(password, loginData.password);

      if (passMatch) {
        if (loginData.is_verified === 0) {
          res.render("login", {
            title: "Login",
            FailMessage: "Please verify your email",
          });
        } else {
          req.session.user_id = loginData._id;
          res.redirect("/home");
        }
      } else {
        res.render("login", {
          title: "Login",
          FailMessage: "Login failed, Invalid user name or password",
        });
      }
    } else {
      res.render("login", {
        title: "Login",
        FailMessage: "Login failed, Invalid user name or password",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

//method to load home page
const loadHome = async (req, res) => {
  try {
    res.render("home", { title: "Home" });
  } catch (error) {
    console.log(error);
  }
};

//method to log out
const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.render("login", { successMessage: "Logout successfully.." });
  } catch (error) {
    console.log(error.message);
  }
};

//method for forgot password
const forgotLoad = async (req, res) => {
  try {
    res.render("forgot", { title: "Forgot password" });
  } catch (error) {
    console.log(error.message);
  }
};

//method for verify forgot password
const forgotVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });

    if (userData) {
      if (userData.is_verified === 0) {
        res.render("forgot", {
          title: "Forgot password",
          message: "Please verify your mail",
        });
      } else {
        const randomString = randomstring.generate();
        const updatedData = await User.updateOne(
          { email: email },
          { $set: { token: randomString } }
        );
        sendResetPassMail(userData.name, userData.email, randomString);

        res.render("forgot", {
          title: "Forgot password",
          message: "Please check your mail to reset password",
        });
      }
    } else {
      res.render("forgot", {
        title: "Forgot password",
        message: "Invalid user mail",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const forgetPassLoad = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token });

    if (tokenData) {
      res.render("forgot-password", {
        title: "Forgot-password",
        user_id: tokenData._id,
      });
    } else {
      res.render("404", { message: "Invalid token" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password, user_id } = req.body;
    const hashPassword = await securePassword(password);
    await User.findByIdAndUpdate(user_id, { $set: { password: hashPassword, token: "" } });
    return res.render("login",{successMessage : "Password reset successfully"});
  
  } catch (error) {
    console.log(error.message);
  }
};

//method for load email verification page
const loadEmailVerification = async (req, res) => {
  try {
    res.render("mailVerification", { title: "Email verification" });
  } catch (error) {}
};

//method for send email verification
const sendVerificationLink = async (req, res) => {
  try {
    const email = req.body.email;
    const mailData = await User.findOne({ email: email });
    if (mailData) {
      sendVerifyMail(mailData.name, mailData.email, mailData._id);

      res.render("mailVerification", {
        title: "Email verification",
        successMsg:
          "Email verification link sent to your email,please verify... ",
      });
    } else {
      res.render("mailVerification", {
        title: "Email verification",
        failMsg: "Email doesn't exist",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadUser,
  insertUser,
  VerifyMail,
  loadLogin,
  verifyLogin,
  loadHome,
  userLogout,
  forgotLoad,
  forgotVerify,
  forgetPassLoad,
  resetPassword,
  loadEmailVerification,
  sendVerificationLink,
};
