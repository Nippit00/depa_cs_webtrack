// **************
// **  Models  **
// **************
const db = require("../db.js");
const bcrypt = require('bcrypt');
exports.getAdPage = (req, res, next) => {
  res.render("admin/ad-main", {
    pageTitle: "Main",
    path: "/",
  });
};

exports.getAddUserPage = (req, res, next) => {
  res.render("admin/ad-city/ad-addUser", {
    pageTitle: "add",
    path: "/",
  });
};
//get city ad-city
exports.getAdCityP = (req, res, next) => {
  const q =
    "SELECT `cityID`, `province`, `date`, `developer`, `executive`, `government_investment`, `private_investment`,`LAT`, `LNG` FROM `citydata` WHERE 1";
  try {
    db.query(q, (err, data) => {
      if (err) return res.status(500).json(err);
      console.log(data);
      res.render("admin/ad-city/ad-city", {
        req,
        pageTitle: "Dashboard",
        path: "/city",
        cityData: data,
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

exports.getAdCityDataP = (req, res, next) => {
  console.log(req.params);
  const q =
    "SELECT * FROM citydata JOIN city_home ON citydata.cityID = city_home.cityID WHERE citydata.cityID = ?;";
  const q2 =
    "SELECT * FROM `solution` JOIN smart ON solution.smartKey = smart.smartKey JOIN kpi on kpi.solutionID=solution.solutionID WHERE solution.cityID=? GROUP BY solution.solutionName";
  try {
    db.query(q, [req.params.cityID], (err, data) => {
      if (err) return res.status(500).json(err);
      console.log("Data is:", data);
      db.query(q2, [req.params.cityID], (errer, solution) => {
        if (err) return res.status(500).json(errer);
        // console.log("solution is:",solution)
        res.render("admin/ad-city/ad-citydata", {
          req,
          pageTitle: "Dashboard",
          path: "/city",
          cityData: data[0],
          solution: solution,
        });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

exports.getAddCity = (req, res, next) => {
  res.render("admin/ad-city/ad-addCity", {
    pageTitle: "add",
    path: "/",
  });
};
exports.postAddCity = (req, res, next) => {
  const { cityID, province, cityName, date, developer, executive, government_investment, private_investment, username, password, password2, LAT, LNG } = req.body;

  // ใช้ bcrypt เพื่อเข้ารหัส password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
          console.error("Error hashing password:", err);
          return res.status(500).send("Internal Server Error");
      }

      // ทำสิ่งที่ต้องการด้วย hashedPassword ที่เข้ารหัสแล้ว
      console.log("Hashed Password:", hashedPassword);

      // ตอบกลับหลังจากทำการเข้ารหัส password แล้ว
      res.status(200).send("Successfully");
  });
};
