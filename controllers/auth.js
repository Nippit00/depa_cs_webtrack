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

exports.PostLogin = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const q = "SELECT * FROM citydata WHERE username = ?";
  db.query(q, [username], (err, data) => {
    try {
      if (err || !data || data.length === 0) {
        // ไม่พบชื่อผู้ใช้ในฐานข้อมูลหรือเกิดข้อผิดพลาดในการค้นหา
        return res.status(404).redirect("/login");
      }

      const cityData = data[0]; // ข้อมูลเมืองที่พบในฐานข้อมูล

      if (cityData.password === password) {
        // รหัสผ่านถูกต้อง
        req.session.isLoggedIn = true;
        req.session.userID = cityData.cityID;

        // บันทึก session
        return req.session.save((err) => {
          if (err) {
            console.log(err);
            req.flash("alert", "invalid login");
            return res.redirect("/login");
          }
          // เมื่อบันทึก session สำเร็จ ให้เปลี่ยนเส้นทางไปยังหน้า "/city"
          res.redirect("/city");
        });
      } else {
        // รหัสผ่านไม่ถูกต้อง
        return res.redirect("/login");
      }
    } catch (err) {
      console.log(err);
      // หากเกิดข้อผิดพลาดในการประมวลผล ส่งกลับไปยังหน้า "/login"
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

