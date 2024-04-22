const db = require("../db.js");
// **************
// **  Models  **
// **************


// ****************
// **  getCity   **
// ****************
exports.GetCity = (req, res) => {
  const cityID = req.session.userID;
  const q =
    "SELECT * FROM citydata JOIN city_home ON citydata.cityID = city_home.cityID WHERE citydata.cityID = ?";
  try {
    db.query(q, [cityID], (err, data) => {
      if (err) return res.status(500).json(err);
      db.query(
        "SELECT `smartKey` FROM `solution` WHERE cityID=? ",
        [cityID],
        (err, result) => {
          if (err) return res.status(500).json(err);
          
          // เก็บจำนวน smart key แต่ละตัวในออบเจกต์
          const smartKeyCounts = {};
          result.forEach(row => {
            if (smartKeyCounts[row.smartKey]) {
              smartKeyCounts[row.smartKey]++;
            } else {
              smartKeyCounts[row.smartKey] = 1;
            }
          });
          res.render("city/city", {
            req,
            pageTitle: data[0].cityname,
            path: "/city",
            cityInfo: data[0],
            citysolution: result,
            smartKeyCounts: smartKeyCounts // ส่งจำนวน smart key แต่ละตัวในออบเจกต์ไปยัง view
          });
        }
      );
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

exports.GetPosition = (req, res) => {
  const cityID = req.session.userID;
  const q =
    "SELECT * FROM citydata JOIN city_home ON citydata.cityID = city_home.cityID WHERE citydata.cityID = ?";
  try {
    db.query(q, [cityID], (err, data) => {
      if (err) return res.status(500).json(err);
      db.query(
        "SELECT `smartKey` FROM `solution` WHERE cityID=? ",
        [cityID],
        (err, result) => {
          if (err) return res.status(500).json(err);
          
          // เก็บจำนวน smart key แต่ละตัวในออบเจกต์
          const smartKeyCounts = {};
          result.forEach(row => {
            if (smartKeyCounts[row.smartKey]) {
              smartKeyCounts[row.smartKey]++;
            } else {
              smartKeyCounts[row.smartKey] = 1;
            }
          });

          console.log(smartKeyCounts)
          res.render("city/map", {
            req,
            pageTitle: data[0].cityname,
            path: "/city",
            cityInfo: data[0],
            citysolution: result,
            smartKeyCounts: smartKeyCounts // ส่งจำนวน smart key แต่ละตัวในออบเจกต์ไปยัง view
          });
        }
      );
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

exports.getCityDashboard = (req, res, next) => {
  const cityID = req.session.userID;
  const q = "SELECT * FROM solution JOIN smart ON solution.smartKey = smart.smartKey JOIN kpi ON kpi.solutionID = solution.solutionID JOIN citydata ON citydata.cityID = solution.cityID WHERE solution.cityID = ?";
  try {
    db.query(q, [cityID], (err, data) => {
      if (err) return res.status(500).json(err);
      console.log(data)
      res.render("city/dashboard", {
        req,
        pageTitle: "Dashboard",
        path: "/city",
        solutionInfo: data,
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};




exports.getCityFollow = (req, res, next) => {
  const cityID = req.session.userID;
  const q = "SELECT * FROM solution JOIN smart ON solution.smartKey = smart.smartKey JOIN kpi ON kpi.solutionID = solution.solutionID JOIN city_home ON city_home.cityID = solution.cityID WHERE solution.cityID = ? GROUP BY solution.solutionName";
  try{
    db.query(q, [cityID], (err, data) => {
      if (err) return res.status(500).json(err);
      res.render("city/follow", {
        pageTitle: "Follow",
        path: "/city",
        followdata: data
      });
    });



  }catch(err){
    console.log(err);
    res.status(500).json(err)
  }
};

exports.getCityUpload = (req, res, next) => {
  // Render the /upload page
  res.render("city/upload", {
    pageTitle: "Upload",
    path: "/city",
  });
};
