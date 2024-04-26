const db = require("../db.js");



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
  db.query(q, [username], (err, data) => {
    try {
      if (err || !data || data.length === 0) {
        // Handle admin login
        const AdminC = "SELECT * FROM `AdminInfo` WHERE AdminUsername = ?";
        db.query(AdminC, [username], (err, adminData) => {
          try {
            if (err || !adminData || adminData.length === 0) {
              return res.status(404).redirect("/login");
            }
            const adminInfo = adminData[0];
            if (adminInfo.AdminPassword === password) {
              req.session.isAdmin = true;
              req.session.userID = adminInfo.AdminUsername;
              return req.session.save((err) => {
                if (err) {
                  console.log(err);
                  req.flash("alert", "invalid login");
                  return res.redirect("/admin");
                }
                console.log("Admin login successful");
                res.redirect("/admin");
              });
            }
          } catch (error) {
            console.log(error);
          }
        });
      } else {
        const cityData = data[0];
        if (cityData.password === password) {
          req.session.isLoggedIn = true;
          req.session.userID = cityData.cityID;
          return req.session.save((err) => {
            if (err) {
              console.log(err);
              req.flash("alert", "invalid login");
              return res.redirect("/login");
            }
            console.log("User login successful");
            res.redirect("/city");
          });
        } else {
          return res.redirect("/login");
        }
      }
    } catch (err) {
      console.log(err);
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

