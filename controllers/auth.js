const db = require("../db.js");

// **************
// **  Models  **
// **************
const city = require("../models/city");
const CityData = require("../models/cityData");

// ****************
// **  getLogin  **
// ****************
exports.getLogin = (req, res, next) => {
  try {
      // Render the login view with CSRF token and additional details
      res.render("auth/login", {
          pageTitle: "Login - Authentication",
          path: "/login",
          csrfToken: req.csrfToken()
      });
  } catch (error) {
      // Handle errors that may occur during rendering
      console.error('Error rendering login page:', error);
      next(error); // Pass errors to Express error handling middleware
  }
};

// *****************
// **  postLogin  **
// *****************

exports.PostLogin = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const q = "SELECT * FROM citydata WHERE username = ?";
  
  try {
    const data = await new Promise((resolve, reject) => {
      db.query(q, [username], (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    if (!data || data.length === 0) {
      return res.status(404).redirect("/login");
    }

    const cityData = data[0];
    
    if (cityData.password === password) {
      req.session.isLoggedIn = true;
      req.session.userID = cityData.cityID;

      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      return res.redirect("/city");
    } else {
      return res.redirect("/login");
    }
  });
};



// ******************
// **  postLogout  **
// ******************
exports.postLogout = (req, res) => {
  // Destroy the session (as logout)
  req.session.destroy((err) => {
    if (err) {
      // If there is an error, redirect to / page
      console.log(err);
      return res.redirect("/");
    }
    res.redirect("/");
  });
};

