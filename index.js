const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/retro_User_manageSys");

const express = require("express");
const app = express();

const path = require("path");
app.use("/static", express.static(path.join(__dirname, "./public")));
app.use("/assets", express.static(path.join(__dirname, "./public/assets")));

const PORT = process.env.PORT || 3000;

//for user route
const userRoute = require("./routers/userRoute");
app.use("/", userRoute);

//for admin route
const adminRoute = require("./routers/adminRoute");
app.use("/admin", adminRoute);

app.listen(PORT, () => {
  console.log(`server running succesfully on http://localhost:${PORT}`);
});
