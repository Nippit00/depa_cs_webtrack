// **************
// **  Models  **
// **************
const db = require("../db.js");

exports.getAdPage = (req, res, next) => {
  res.render("admin/ad-main", {
    pageTitle: "Main",
    path: "/",
  });
};

exports.getAddUserPage=(req,res,next)=>{
  res.render("admin/ad-city/ad-addUser",{
    pageTitle: "add",
    path: "/",
  });
}
//get city ad-city
exports.getAdCityP = (req, res, next) => {
  const q = "SELECT `cityID`, `province`, `date`, `developer`, `executive`, `government_investment`, `private_investment`,`LAT`, `LNG` FROM `citydata` WHERE 1";
  try {
    db.query(q, (err, data) => {
      if (err) return res.status(500).json(err);
      console.log(data)
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
  console.log(req.params)
  const q = "SELECT * FROM citydata JOIN city_home ON citydata.cityID = city_home.cityID WHERE citydata.cityID = ?;";
  const q2 ="SELECT * FROM `solution` JOIN smart ON solution.smartKey = smart.smartKey JOIN kpi on kpi.solutionID=solution.solutionID WHERE solution.cityID=? GROUP BY solution.solutionName"
  try {
    db.query(q,[req.params.cityID], (err, data) => {
      if (err) return res.status(500).json(err);
      console.log("Data is:",data)
      db.query(q2,[req.params.cityID],(errer,solution)=>{
        if(err)return res.status(500).json(errer)
        // console.log("solution is:",solution)
      res.render("admin/ad-city/ad-citydata", {
        req,
        pageTitle: "Dashboard",
        path: "/city",
        cityData: data[0],
        solution:solution,
      });
      })
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

// SELECT * FROM citydata JOIN city_home ON citydata.cityID = city_home.cityID JOIN solution ON citydata.cityID=solution.cityID WHERE citydata.cityID = 6201;