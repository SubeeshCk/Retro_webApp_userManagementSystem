const islogin = async (req, res, next) => {
    try {
      if (req.session.user_id) {
        next(); // Call next() if user is logged in
      } else {
        res.redirect("/admin"); // Redirect if user is not logged in
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  };
  
  const islogout = async (req, res, next) => {
    try {
      if (req.session.user_id) {
        res.redirect("/admin/home"); // Redirect if user is logged in
      } else {
        next(); // Call next() if user is not logged in
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  };
  
  module.exports = {
    islogin,
    islogout
  };