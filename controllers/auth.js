// **************
// **  Models  **
// **************
const city = require("../models/city");
const CityData = require("../models/cityData");

// ****************
// **  getLogin  **
// ****************
exports.getLogin = (req, res, next) => {
  // Render the /login page
  res.render("auth/login", {
    req, 
    pageTitle: "Authentication",
    path: "/login",
  });
};

// *****************
// **  postLogin  **
// *****************
exports.postLogin = (req, res, next) => {
  // Get the user's inputs: username & password
  const username = req.body.username;
  const password = req.body.password;
  console.log(req.body);

  CityData.findOne({ username: username }).then((cityData) => {
    console.log(cityData);
    if (!cityData) {
      // This username is not founded
      return res.redirect("/login");
    }

    if (cityData.password == password) {
      // If the password is matched
      // Update the session .isLoggedIn and .user
      req.session.isLoggedIn = true;
      req.session.userID = cityData.cityID;

      // Save the session
      return req.session.save((err) => {
        if (err) {
          // If there is an error, redirect to /login page
          console.log(err);
          req.flash("alert", "invalid login");
          return res.redirect("/login");
        }
        res.redirect("/city");
      });
    } else {
      return res.redirect("/login");
    }
  });
};

// ******************
// **  postLogout  **
// ******************
exports.postLogout = (req, res, next) => {
  // Destroy the session (as logout)
  req.session.destroy((err) => {
    if (err) {
      // If there is an error, redirect to / page
      console.log(err);
      return res.redirect("/");
    }
    res.redirect("/login");
  });
};
