const db = require("../db.js");

exports.getform = (req, res, next) => {
  res.render("form", { req, pageTitle: "form" });
};

exports.postFormcheck = (req, res, next) => {
  console.log(req.body)
  const dataCheck = req.body
  const q = "SELECT * FROM anssolution JOIN solution ON anssolution.solutionID = solution.solutionID JOIN city_home ON solution.cityID = city_home.cityID WHERE anssolution.solutionID = ?"
  const id = req.params.solutionID
  db.query(q,id,(err,data)=>{
    if(err) return res.status(500).json(errformcheck,err)
    res.render("formcheck", { 
      req, pageTitle: "form" ,
      data:data[0],
      dataCheck:dataCheck
    });
  })
};

exports.comfirmFormcheck = (req, res, next) => {
  console.log(req.body);
  try {
    res.json({ "status": "ok" }); 
  } catch (err) {
    console.log(err);
    res.status(500).json({ "err": err }); 
  }
};



exports.getformCdp = (req, res, next) => {
  const solutionid = req.params.solutionID;
  const cityID = req.session.userID;
  const q1 = "SELECT * FROM solution JOIN smart ON solution.smartKey = smart.smartKey JOIN kpi ON kpi.solutionID = solution.solutionID JOIN city_home ON city_home.cityID = solution.cityID WHERE solution.cityID = ? AND solution.solutionID = ? ";
  const q2 = "SELECT * FROM anssolution WHERE solutionID = ?;";
  const q3 ="SELECT * FROM `question` WHERE 1"
  try {
    db.query(q1, [cityID, solutionid], (err, data) => {
      if (err) return res.status(500).json(err);
      
      db.query(q2, [solutionid], (err, dataOld) => {
        // console.log(dataOld[0].Q10)
        if (err) return res.status(500).json(err);
        db.query(q3,(err,question)=>{
          if (err) return res.status(500).json(err);
          // console.log(question)
          res.render("form-cdp", {
            formdata: data,
            dataOld: dataOld|| [],
            csrfToken: req.csrfToken(),
            question:question,
          
          });
        })
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

exports.postFormCdp = (req, res, next) => {
  try {
      console.log(req.body);
      console.log("insertform complete");

      const postData = req.body;
      const solutionParam = req.params;
      const qUpdateStatus = "UPDATE solution SET status = 1 WHERE solutionID = ?";
      let qInsert;
      let qUpdate;
      const qFetchData = "SELECT * FROM anssolution WHERE solutionID = ?";

      db.query(qFetchData, [solutionParam.solutionID], (err, fetchData) => {
          if (err) return res.status(500).json({ error: "FetchDataError", message: err });

          const numberOfQuestions = Object.keys(postData).filter(key => key.startsWith('Q')).length;
          //ถ้าเจอ
          // console.log("จำนวนQ:",numberOfQuestions)
          if (fetchData && fetchData.length > 0) {
              // Update existing data
              qUpdate = `UPDATE anssolution SET timestamp = ?`;
              for (let i = 1; i <= numberOfQuestions; i++) {
                  qUpdate += `, Q${i}=?`;
              }
              qUpdate += ` WHERE solutionID=?`;

              const updateParams = [
                  postData.currentDateTime,
              ];
              for (let i = 1; i <= numberOfQuestions; i++) {
                  updateParams.push(postData[`Q${i}`] ); // Ensure all values are provided or set to null
              }
         

              updateParams.push(solutionParam.solutionID);
              console.log("command:",qUpdate)
              console.log("Update Param:",updateParams)
              db.query(qUpdate, updateParams, (err, updateData) => {
                  if (err) return res.status(500).json({ error: "UpdateError", message: err });
                  db.query(qUpdateStatus, [solutionParam.solutionID], (err, updateStatusData) => {
                      if (err) return res.status(500).json({ error: "UpdateStatusError", message: err });
                      return res.redirect(`/formcdp/${req.params.solutionID}?success=true`);
                  });
              });
              //ถ้าไม่เจอ
          } else {
              // Insert new data
              qInsert = `INSERT INTO anssolution (solutionID, timestamp`;
              for (let i = 1; i <= numberOfQuestions; i++) {
                  qInsert += `, Q${i}`;
              }
              qInsert += `) VALUES (?,?`;
              for (let i = 1; i <= numberOfQuestions; i++) {
                  qInsert += `,?`;
              }
              qInsert += `)`;

              const insertParams = [
                  solutionParam.solutionID,
                  postData.currentDateTime,
              ];
              for (let i = 1; i <= numberOfQuestions; i++) {
                  insertParams.push(postData[`Q${i}`] ); // Ensure all values are provided or set to null
              }
              console.log("Q Insert :",qInsert)
              console.log("insertParams:",insertParams)
              db.query(qInsert, insertParams, (err, insertData) => {
                  if (err) return res.status(500).json({ error: "InsertDataError", message: err });
                  db.query(qUpdateStatus, [solutionParam.solutionID], (err, updateStatusData) => {
                      if (err) return res.status(500).json({ error: "UpdateStatusError", message: err });
                      return res.redirect(`/formcdp/${req.params.solutionID}?success=true`);
                  });
              });
          }
      });

  } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
};



exports.submitFormCdp = (req, res, next) => {
//   try {
//     console.log("submit complete")
//     const postData = req.body;
//     const solutionParam = req.params;
//     const qInsert = "INSERT INTO anssolution (solutionID, timestamp, Q1, Q2,  Q4, Q5, Q6, Q7, Q8, Q9) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
//     const qUpdateStatus = "UPDATE solution SET status = 2 WHERE solutionID = ?";
//     const qFechdata = "SELECT * FROM anssolution WHERE solutionID = ?";
//     const qUpdate = "UPDATE anssolution SET timestamp = ?, Q1=?, Q2=?,  Q4=?, Q5=?, Q6=?, Q7=?, Q8=?, Q9=? WHERE solutionID=?;";

//     db.query(qFechdata, [solutionParam.solutionID], (err, fechData) => {
//       if (err) return res.status(500).json({ error: "FechdataError", message: err });
//       if (fechData && fechData.length > 0) {
//         db.query(qUpdate, [postData.currentDateTime, postData.status, postData.progress,  postData.operation, postData.problem_type, postData.result, postData.problem, postData.solution, postData.note, solutionParam.solutionID], (err, updateData) => {
//           if (err) return res.status(500).json({ error: "updateError", message: err });
//           db.query(qUpdateStatus, [solutionParam.solutionID], (err, updateStatusData) => {
//             if (err) return res.status(500).json({ error: "updateStatusError", message: err });
//             return res.redirect(`/formcdp/${req.params.solutionID}?success=true`);
//           });
//         });
//       } else {
//         db.query(qInsert, [solutionParam.solutionID, postData.currentDateTime, postData.status, postData.progress,  postData.operation, postData.problem_type, postData.result, postData.problem, postData.solution, postData.note], (err, insertData) => {
//           if (err) return res.status(500).json({ error: "insertDataError", message: err });
//           db.query(qUpdateStatus, [solutionParam.solutionID], (err, updateStatusData) => {
//             if (err) return res.status(500).json({ error: "updateStatusError", message: err });
//             return res.redirect(`/formcdp/${req.params.solutionID}?success=true`);
//           });
//         });
//       }
//     });

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "Internal Server Error", message: err.message });
//   }
};





