const db = require("../db.js");
const axios = require("axios");

exports.getformSmart = (req, res, next) => {
  const solutionid = req.params.solutionID;
  const cityID = req.session.userID;
  const round=req.params.round
  // console.log("Round is:"+round)
  const q1 =
    "SELECT * FROM solution JOIN smart ON solution.smartKey = smart.smartKey JOIN city_home ON city_home.cityID = solution.cityID WHERE solution.cityID = ? AND solution.solutionID = ? ";
  const q2 = "SELECT * FROM anssolution WHERE solutionID = ?;";
  const q3 = "SELECT * FROM `question` WHERE 1";
  const q4 = "SELECT * FROM `kpi` JOIN anskpi ON kpi.kpiID = anskpi.kpiID WHERE kpi.solutionID = ?";

  try {
    db.query(q1, [cityID, solutionid], (err, data) => {
      if (err) return res.status(500).json(err);
      db.query(q2, [solutionid], (err, dataOld) => {
        // console.log(dataOld)
        if (err) return res.status(500).json(err);
        db.query(q3, (err, question) => {
          if (err) return res.status(500).json(err);
          db.query(q4, [solutionid], (err, kpi) => {
            // console.log("length: "+ kpi.length)
            if (err) return res.status(500).json(err);
            if (kpi.length > 0) {
              res.render("form-smart", {
                kpiQ: kpi,
                formdata: data,
                dataOld: dataOld || [],
                csrfToken: req.csrfToken(),
                question: question,
                round:round,
              });
            } else {
              const q5 = "SELECT * FROM `kpi` WHERE solutionID = ?";
              db.query(q5, [solutionid], (err, kpi) => {
                if (err) return res.status(500).json(err);
                res.render("form-smart", {
                  kpiQ: kpi,
                  formdata: data,
                  dataOld: dataOld || [],
                  csrfToken: req.csrfToken(),
                  question: question,
                  round:round,
                });
              });
            }
          });
        });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};




//Get formcdpPart1
exports.getformCdp1 = (req, res, next) => {
  const solutionid = req.params.solutionID;
  const cityID = req.session.userID;
  const q1 =
    "SELECT * FROM solution JOIN smart ON solution.smartKey = smart.smartKey JOIN kpi ON kpi.solutionID = solution.solutionID JOIN city_home ON city_home.cityID = solution.cityID WHERE solution.cityID = ? AND solution.solutionID = ? ";
  const q2 = "SELECT * FROM anssolution WHERE solutionID = ?;";
  const q3 = "SELECT * FROM `question` WHERE 1";
  const q4 = "SELECT * FROM `anskpi` WHERE solutionID=?"
  const qKpi = "SELECT * FROM kpi WHERE solutionID=?"
  try {
    db.query(q1, [cityID, solutionid], (err, data) => {
      if (err) return res.status(500).json(err);
      db.query(q2, [solutionid], (err, dataOld) => {
        if (err) return res.status(500).json(err);
        db.query(q3, (err, question) => {
          if (err) return res.status(500).json(err);
          db.query(q4,[solutionid], (err, kpiOld) => {
            if (err) return res.status(500).json(err);
            db.query(qKpi,[solutionid],(err,datakpi)=>{
              if (err) return res.status(500).json(err);
              res.render("form-cdpPart1", {
                formdata: data,
                datakpi:kpiOld|| [],
                csrfToken: req.csrfToken(),
                question: question,
                datakpi:datakpi,
                dataOld:dataOld
              });
            })
          });
        });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};





//Saveform
exports.saveAnsObj = (req, res, next) => {
  const dataArray = [];
  const kpiArray = [];
  const solutionID = req.params.solutionID;
  const qUpdate = "UPDATE solution SET status = 1 WHERE solutionID = ?";

  // Loop through request body to extract question-answer pairs
  for (const key in req.body) {
    if (key.startsWith('Q')) {
      const qKey = key;
      const aKey = 'A' + key.substring(1);
      const questionObj = {};
      questionObj['Question'] = req.body[qKey];
      questionObj['Answer'] = req.body[aKey];
      dataArray.push(questionObj);
    }
    // Extract KPI data
    if (key.startsWith(solutionID)) {
      const kpiID = key; // Use the whole key as kpiID since it matches your example
      const kpiAnswer = req.body[key];
      kpiArray.push({ kpiID, kpiAnswer });
    }
  }

  // Check if the solutionID exists in the database
  const checkQuery = "SELECT * FROM `anssolution` WHERE `solutionID` = ?";
  db.query(checkQuery, [solutionID], (err, rows) => {
    if (err) {
      console.error("Error checking existing data:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Function to handle KPI data insertion or update
    const handleKpiData = (callback) => {
      const kpiQueries = kpiArray.map(kpi => {
        return new Promise((resolve, reject) => {
          const checkKpiQuery = "SELECT * FROM `anskpi` WHERE `solutionID` = ? AND `kpiID` = ?";
          db.query(checkKpiQuery, [solutionID, kpi.kpiID], (err, kpiRows) => {
            if (err) {
              return reject(err);
            }
            if (kpiRows.length > 0) {
              const updateKpiQuery = "UPDATE `anskpi` SET `timestamp` = ?, `ans` = ? WHERE `solutionID` = ? AND `kpiID` = ?";
              db.query(updateKpiQuery, [new Date(), kpi.kpiAnswer, solutionID, kpi.kpiID], (err, result) => {
                if (err) {
                  return reject(err);
                }
                resolve(result);
              });
            } else {
              const insertKpiQuery = "INSERT INTO `anskpi`(`solutionID`, `kpiID`, `timestamp`, `ans`) VALUES (?,?,?,?)";
              db.query(insertKpiQuery, [solutionID, kpi.kpiID, new Date(), kpi.kpiAnswer], (err, result) => {
                if (err) {
                  return reject(err);
                }
                resolve(result);
              });
            }
          });
        });
      });

      Promise.all(kpiQueries)
        .then(results => callback(null, results))
        .catch(err => callback(err));
    };

    // If solutionID exists, update the row; otherwise, insert a new row
    if (rows.length > 0) {
      const updateQuery = "UPDATE `anssolution` SET `timestamp` = ?, `ans` = ? WHERE `solutionID` = ?";
      db.query(updateQuery, [new Date(), JSON.stringify(dataArray), solutionID], (err, result) => {
        if (err) {
          console.error("Error updating data:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        console.log("Data updated successfully");

        handleKpiData((err, results) => {
          if (err) {
            console.error("Error handling KPI data:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          // Update the status of the solution to 1 (indicating completion)
          db.query(qUpdate, [solutionID], (err, result) => {
            if (err) {
              console.error("Error updating status:", err);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            console.log("Status updated successfully");
            return res.redirect(`/formsmart/${req.params.solutionID}/${req.params.round}?success=true`);
          });
        });
      });
    } else {
      const insertQuery = "INSERT INTO `anssolution`(`solutionID`, `timestamp`, `Round`, `ans`) VALUES (?,?,?,?)";
      db.query(insertQuery, [solutionID, new Date(), req.params.round, JSON.stringify(dataArray)], (err, result) => {
        if (err) {
          console.error("Error inserting data:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        console.log("Data inserted successfully");

        handleKpiData((err, results) => {
          if (err) {
            console.error("Error handling KPI data:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          // Update the status of the solution to 1 (indicating completion)
          db.query(qUpdate, [solutionID], (err, result) => {
            if (err) {
              console.error("Error updating status:", err);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            console.log("Status updated successfully");
            return res.redirect(`/formsmart/${req.params.solutionID}/${req.params.round}?success=true`);
          });
        });
      });
    }
  });
};






//SaveformCdpPart1
exports.saveAnsObjcdp1 = (req, res, next) => {
  const dataArray = [];
  const kpiArray = [];
  const solutionID = req.params.solutionID;
  const qUpdate = "UPDATE solution SET status = 1 WHERE solutionID = ?";
  
  // Loop through request body to extract question-answer pairs
  for (const key in req.body) {
    if (key.startsWith('Q')) {
      const qKey = key;
      const aKey = 'A' + key.substring(1);
      const questionObj = {};
      questionObj['Question'] = req.body[qKey];
      questionObj['Answer'] = req.body[aKey];
      dataArray.push(questionObj);
    }
    // Extract KPI data
    if (key.startsWith(solutionID)) {
      const kpiKey = key.substring(solutionID.length + 1); // Extract KPI ID
      const kpiAnswer = req.body[key];
      const kpiID = kpiKey.split('-')[0]; // Extract the part before the dash
      kpiArray.push({ kpiID, kpiAnswer });
    }
  }

  // Check if the solutionID exists in the database
  const checkQuery = "SELECT * FROM `anssolution` WHERE `solutionID` = ?";
  db.query(checkQuery, [solutionID], (err, rows) => {
    if (err) {
      console.error("Error checking existing data:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // If solutionID exists, update the row; otherwise, insert a new row
    if (rows.length > 0) {
      const updateQuery = "UPDATE `anssolution` SET `timestamp` = ?, `ans` = ? WHERE `solutionID` = ?";
      db.query(updateQuery, [new Date(), JSON.stringify(dataArray), solutionID], (err, result) => {
        if (err) {
          console.error("Error updating data:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        console.log("Data updated successfully");
        // Update the status of the solution to 1 (indicating completion)
        db.query(qUpdate, [solutionID], (err, result) => {
          if (err) {
            console.error("Error updating status:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          console.log("Status updated successfully");
          return res.redirect(`/formcdp1/${req.params.solutionID}?success=true`);
        });
      });
    } else {
      const insertQuery = "INSERT INTO `anssolution`(`solutionID`, `timestamp`,`Round`, `ans`) VALUES (?,?,'1',?)";
      db.query(insertQuery, [solutionID, new Date(), JSON.stringify(dataArray)], (err, result) => {
        if (err) {
          console.error("Error inserting data:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        console.log("Data inserted successfully");
        // Update the status of the solution to 1 (indicating completion)
        db.query(qUpdate, [solutionID], (err, result) => {
          if (err) {
            console.error("Error updating status:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          console.log("Status updated successfully");
          return res.redirect(`/formcdp1/${req.params.solutionID}?success=true`);
        });
      });
    }
  });
};


exports.postFormcheck = (req, res, next) => {
  const dataForm = req.body
  try {
    return res.render({
      
    })
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};









