const db = require("../db.js");

exports.getform = (req, res, next) => {
    res.render("form", { req, pageTitle: "form"});
  };

exports.getformCdp = (req, res, next) => {
  const solutionid = req.params.solutionID
  const cityID = req.session.userID;
  const q = "SELECT * FROM solution JOIN smart ON solution.smartKey = smart.smartKey JOIN kpi ON kpi.solutionID = solution.solutionID JOIN city_home ON city_home.cityID = solution.cityID WHERE solution.cityID = ? AND solution.solutionID = ? ";
  try{
    db.query(q, [cityID,solutionid], (err, data) => { 
      if (err) return res.status(500).json(err);
      res.render("form-cdp", {
        formdata: data,
        csrfToken: req.csrfToken()
      });
    });



  }catch(err){
    console.log(err);
    res.status(500).json(err)
  }
  };

exports.postFormCdp = (req, res, next) => {
  console.log(req.body)
  console.log(req.params)
    try{

      return res.redirect(`/formcdp/${req.params.solutionID}`);
      // return res.status(200).json({ message: "Data saved successfully" });
    }catch(err){
      console.log(err);
      res.status(500).json(err)
    }
    };

  
