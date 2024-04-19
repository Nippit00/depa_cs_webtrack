const db = require("../db.js");

exports.getform = (req, res, next) => {
    res.render("form", { req, pageTitle: "form"});
  };

exports.getformCdp = (req, res, next) => {
    const cityID = req.session.userID;
  const q = "SELECT * FROM solution JOIN smart ON solution.smartKey = smart.smartKey JOIN kpi ON kpi.solutionID = solution.solutionID JOIN city_home ON city_home.cityID = solution.cityID WHERE solution.cityID = ? GROUP BY solution.solutionName";
  try{
    db.query(q, [cityID], (err, data) => {
        console.log(data)
      if (err) return res.status(500).json(err);
      res.render("form-cdp", {
        formdata: data
      });
    });



  }catch(err){
    console.log(err);
    res.status(500).json(err)
  }
  };


  
