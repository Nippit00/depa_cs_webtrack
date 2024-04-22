const db = require("../db.js");

exports.getform = (req, res, next) => {
  res.render("form", { req, pageTitle: "form" });
};

exports.getformCdp = (req, res, next) => {
  const solutionid = req.params.solutionID;
  const cityID = req.session.userID;
  const q1 = "SELECT * FROM solution JOIN smart ON solution.smartKey = smart.smartKey JOIN kpi ON kpi.solutionID = solution.solutionID JOIN city_home ON city_home.cityID = solution.cityID WHERE solution.cityID = ? AND solution.solutionID = ? ";
  const q2 = "SELECT * FROM anssolution WHERE solutionID = ?;";

  try {
    db.query(q1, [cityID, solutionid], (err, data) => {
      if (err) return res.status(500).json(err);
      
      db.query(q2, [solutionid], (err, dataOld) => {
        if (err) return res.status(500).json(err);
        
        res.render("form-cdp", {
          formdata: data,
          dataOld: dataOld || [],
          csrfToken: req.csrfToken()
        });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};


exports.postFormCdp = (req, res, next) => {
  try {
    console.log(req.body)
    const postData = req.body
    const solutionParam = req.params
    const qInsert = "INSERT INTO anssolution (solutionID, timestamp, Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)"
    const qFechdata = "SELECT * FROM anssolution WHERE solutionID = ?"
    const qUpdate = "UPDATE anssolution SET timestamp = ?, Q1=?, Q2=?, Q3=?, Q4=?, Q5=?, Q6=?, Q7=?, Q8=?, Q9=? WHERE solutionID=?;"
    db.query(qFechdata,[solutionParam.solutionID],(err,fechData)=>{
      if(err) return res.status(500).json("FechdataError",err)
      if (fechData && fechData.length > 0) {
        db.query(qUpdate,[postData.currentDateTime,postData.status,postData.progress,postData.fileUpload,postData.operation,
          postData.problem_type,postData.result,postData.problem,postData.solution,postData.note,solutionParam.solutionID],(err,updataData)=>{
            if(err) return res.status(500).json("updataError",err)
            return res.redirect(`/formcdp/${req.params.solutionID}?success=true`);
          })
      } else {
        db.query(qInsert,[solutionParam.solutionID,postData.currentDateTime,postData.status,postData.progress,postData.fileUpload,postData.operation,
          postData.problem_type,postData.result,postData.problem,postData.solution,postData.note,0],(err,insertData)=>{
            if(err) return res.status(500).json("insertdataError",err)

            return res.redirect(`/formcdp/${req.params.solutionID}?success=true`);
          })
      }
    })
    
  } catch (err) {
    console.log(err);
    res.status(500).json(err)
  }
};

exports.postSubmitCdp =(req,res)=>{
  try {
      console.log(req.body)
      res.status(200)
  } catch (error) {
    console.log(error)
    
  } 
}