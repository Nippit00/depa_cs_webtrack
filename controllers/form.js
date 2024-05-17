const db = require("../db.js");
const axios = require("axios");

exports.getform = (req, res, next) => {
  res.render("form", { req, pageTitle: "form" });
};

exports.getformCdp1 = (req, res, next) => {
  const solutionid = req.params.solutionID;
  const cityID = req.session.userID;
  const q1 =
    "SELECT * FROM solution JOIN smart ON solution.smartKey = smart.smartKey JOIN kpi ON kpi.solutionID = solution.solutionID JOIN city_home ON city_home.cityID = solution.cityID WHERE solution.cityID = ? AND solution.solutionID = ? ";
  const q2 = "SELECT * FROM anssolution2 WHERE solutionID = ?;";
  const q3 = "SELECT * FROM `question` WHERE 1";
  const q4 = "SELECT * FROM `anskpi` WHERE solutionID=?"
  try {
    db.query(q1, [cityID, solutionid], (err, data) => {
      if (err) return res.status(500).json(err);
      // console.log(data)
      db.query(q2, [solutionid], (err, dataOld) => {
      // console.log(dataOld)
        if (err) return res.status(500).json(err);
        db.query(q3, (err, question) => {
          if (err) return res.status(500).json(err);
          db.query(q4,[solutionid], (err, kpiOld) => {
            if (err) return res.status(500).json(err);
            res.render("form-cdpPart1", {
              formdata: data,
              datakpi:kpiOld|| [],
              dataOld: dataOld || [],
              csrfToken: req.csrfToken(),
              question: question,
            });
          });
        });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

exports.postFormcheck = (req, res, next) => {
  const dataCheck = req.body;
  const q =
    "SELECT * FROM solution JOIN city_home ON solution.cityID = city_home.cityID WHERE solution.solutionID = ?";
  const qKpi = "SELECT anskpi.kpiID,anskpi.solutionID,anskpi.ans,kpi.kpiID,kpi.solutionID,kpi.kpiName FROM anskpi JOIN kpi ON anskpi.solutionID = kpi.solutionID WHERE anskpi.solutionID = ? GROUP BY kpi.kpiName"
  const id = req.params.solutionID;
  db.query(q, id, (err, data) => {
    if (err) return res.status(500).json("errformcheck", err);
     db.query(qKpi,[id],(err,dataKpi)=>{
      if (err) return res.status(500).json("errKpiformcheck", err);
      res.render("formcheck", {
        req,
        pageTitle: "form",
        data: data[0],
        dataCheck: dataCheck,
        dataKpi:dataKpi
      });
     })
  });
};

exports.postFormcheck2 = (req, res, next) => {
  const dataCheck = req.body;
  const q =
    "SELECT * FROM solution JOIN city_home ON solution.cityID = city_home.cityID WHERE solution.solutionID = ?";
  const qKpi = "SELECT anskpi.kpiID,anskpi.solutionID,anskpi.ans,kpi.kpiID,kpi.solutionID,kpi.kpiName FROM anskpi JOIN kpi ON anskpi.solutionID = kpi.solutionID WHERE anskpi.solutionID = ? GROUP BY kpi.kpiName"
  const id = req.params.solutionID;
  db.query(q, id, (err, data) => {
    if (err) return res.status(500).json("errformcheck", err);
     db.query(qKpi,[id],(err,dataKpi)=>{
      if (err) return res.status(500).json("errKpiformcheck", err);
      res.render("formcheck-round2", {
        req,
        pageTitle: "form",
        data: data[0],
        dataCheck: dataCheck,
        dataKpi:dataKpi
      });
     })
  });
};

exports.comfirmFormcheck = (req, res, next) => {
  const dataArray = [];
  const kpiArray = [];
  const solutionID = req.params.solutionID;
  const qUpdate = "UPDATE solution SET status = 2 WHERE solutionID = ?;"

  // Loop through request body to extract question-answer pairs
  for (const key in req.body.dataChecks) {
    if (key.startsWith('Q')) {
      const qKey = key;
      const aKey = 'A' + key.substring(1);
      const questionObj = {};
      questionObj['Question'] = req.body.dataChecks[qKey];
      questionObj['Answer'] = req.body.dataChecks[aKey];
      dataArray.push(questionObj);
    }
    // Extract KPI data
    if (key.startsWith(solutionID)) {
      const kpiKey = key.substring(solutionID.length + 1); // Extract KPI ID
      const kpiAnswer = req.body.dataChecks[key];
      const kpiID = kpiKey.split('-')[0]; // Extract the part before the dash
      kpiArray.push({ kpiID, kpiAnswer });
    }
  }

  const checkKPI = "SELECT * FROM `anskpi` WHERE solutionID=?";
  db.query(checkKPI, [solutionID], (err, result) => {
    if (err) {
      console.error("Error checking KPI data:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.length > 0) {
      const kpiQuery = "UPDATE `anskpi` SET `solutionID`=?,`kpiID`=?,`timestamp`=?,`ans`=? WHERE kpiID=?";
      kpiArray.forEach(kpi => {
        db.query(kpiQuery, [solutionID, solutionID + "-" + kpi.kpiID, new Date(), kpi.kpiAnswer, solutionID + "-" + kpi.kpiID], (err, result) => {
          if (err) {
            console.error("Error updating KPI data:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          console.log("KPI updated successfully");
        });
      });
    } else {
      const kpiQuery = "INSERT INTO `anskpi`(`solutionID`, `kpiID`, `timestamp`, `ans`) VALUES (?,?,?,?)";
      kpiArray.forEach(kpi => {
        db.query(kpiQuery, [solutionID, solutionID + "-" + kpi.kpiID, new Date(), kpi.kpiAnswer], (err, result) => {
          if (err) {
            console.error("Error inserting KPI data:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          console.log("KPI data inserted successfully");
        });
      });
    }
  });

  // Check if the solutionID exists in the database
  const checkQuery = "SELECT * FROM `anssolution2` WHERE `solutionID` = ?";
  db.query(checkQuery, [solutionID], (err, rows) => {
    if (err) {
      console.error("Error checking existing data:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // If solutionID exists, update the row; otherwise, insert a new row
    if (rows.length > 0) {
      const updateQuery = "UPDATE `anssolution2` SET `timestamp` = ?, `ans` = ? WHERE `solutionID` = ?";
      db.query(updateQuery, [new Date(), JSON.stringify(dataArray), solutionID], (err, result) => {
        if (err) {
          console.error("Error updating data:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        console.log("Data updated successfully");

        // Perform qUpdate after everything else is successful
        db.query(qUpdate, [solutionID], (err, result) => {
          if (err) {
            console.error("Error updating solution status:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          console.log("Solution status updated successfully");
          return res.redirect(`/formsmart/${req.params.solutionID}?success=true`);
        });
      });
    } else {
      const insertQuery = "INSERT INTO `anssolution2`(`solutionID`, `timestamp`, `ans`) VALUES (?,?,?)";
      db.query(insertQuery, [solutionID, new Date(), JSON.stringify(dataArray)], (err, result) => {
        if (err) {
          console.error("Error inserting data:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        console.log("Data inserted successfully");

        // Perform qUpdate after everything else is successful
        db.query(qUpdate, [solutionID], (err, result) => {
          if (err) {
            console.error("Error updating solution status:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          console.log("Solution status updated successfully");
          return res.redirect(`/formsmart/${req.params.solutionID}?success=true`);
        });
      });
    }
  });
};


exports.comfirmFormcheck2 = (req, res, next) => {
  console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
  const dataArray = [];
  const kpiArray = [];
  const solutionID = req.params.solutionID;
  const qUpdate = "UPDATE solution SET status_round2 = 2 WHERE solutionID = ?;"

  // Loop through request body to extract question-answer pairs
  for (const key in req.body.dataChecks) {
    if (key.startsWith('Q')) {
      const qKey = key;
      const aKey = 'A' + key.substring(1);
      const questionObj = {};
      questionObj['Question'] = req.body.dataChecks[qKey];
      questionObj['Answer'] = req.body.dataChecks[aKey];
      dataArray.push(questionObj);
    }
    // Extract KPI data
    if (key.startsWith(solutionID)) {
      const kpiKey = key.substring(solutionID.length + 1); // Extract KPI ID
      const kpiAnswer = req.body.dataChecks[key];
      const kpiID = kpiKey.split('-')[0]; // Extract the part before the dash
      kpiArray.push({ kpiID, kpiAnswer });
    }
  }

  const checkKPI = "SELECT * FROM `anskpi` WHERE solutionID=?";
  db.query(checkKPI, [solutionID], (err, result) => {
    if (err) {
      console.error("Error checking KPI data:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.length > 0) {
      const kpiQuery = "UPDATE `anskpi` SET `solutionID`=?,`kpiID`=?,`timestamp`=?,`ans`=? WHERE kpiID=?";
      kpiArray.forEach(kpi => {
        db.query(kpiQuery, [solutionID, solutionID + "-" + kpi.kpiID, new Date(), kpi.kpiAnswer, solutionID + "-" + kpi.kpiID], (err, result) => {
          if (err) {
            console.error("Error updating KPI data:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          console.log("KPI updated successfully");
        });
      });
    } else {
      const kpiQuery = "INSERT INTO `anskpi`(`solutionID`, `kpiID`, `timestamp`, `ans`) VALUES (?,?,?,?)";
      kpiArray.forEach(kpi => {
        db.query(kpiQuery, [solutionID, solutionID + "-" + kpi.kpiID, new Date(), kpi.kpiAnswer], (err, result) => {
          if (err) {
            console.error("Error inserting KPI data:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          console.log("KPI data inserted successfully");
        });
      });
    }
  });

  // Check if the solutionID exists in the database
  const checkQuery = "SELECT * FROM `anssolution2_round2` WHERE `solutionID` = ?";
  db.query(checkQuery, [solutionID], (err, rows) => {
    if (err) {
      console.error("Error checking existing data:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // If solutionID exists, update the row; otherwise, insert a new row
    if (rows.length > 0) {
      const updateQuery = "UPDATE `anssolution2_round2` SET `timestamp` = ?, `ans` = ? WHERE `solutionID` = ?";
      db.query(updateQuery, [new Date(), JSON.stringify(dataArray), solutionID], (err, result) => {
        if (err) {
          console.error("Error updating data:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        console.log("Data updated successfully");

        // Perform qUpdate after everything else is successful
        db.query(qUpdate, [solutionID], (err, result) => {
          if (err) {
            console.error("Error updating solution status:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          console.log("Solution status updated successfully");
          return res.redirect(`/formsmart/${req.params.solutionID}?success=true`);
        });
      });
    } else {
      const insertQuery = "INSERT INTO `anssolution2_round2`(`solutionID`, `timestamp`, `ans`) VALUES (?,?,?)";
      db.query(insertQuery, [solutionID, new Date(), JSON.stringify(dataArray)], (err, result) => {
        if (err) {
          console.error("Error inserting data:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        console.log("Data inserted successfully");

        // Perform qUpdate after everything else is successful
        db.query(qUpdate, [solutionID], (err, result) => {
          if (err) {
            console.error("Error updating solution status:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          console.log("Solution status updated successfully");
          return res.redirect(`/formsmart/${req.params.solutionID}?success=true`);
        });
      });
    }
  });
};

exports.getformSmart = (req, res, next) => {
  const solutionid = req.params.solutionID;
  const cityID = req.session.userID;
  const q1 =
    "SELECT * FROM solution JOIN smart ON solution.smartKey = smart.smartKey JOIN kpi ON kpi.solutionID = solution.solutionID JOIN city_home ON city_home.cityID = solution.cityID WHERE solution.cityID = ? AND solution.solutionID = ? ";
  const q2 = "SELECT * FROM anssolution2 WHERE solutionID = ?;";
  const q3 = "SELECT * FROM `question` WHERE 1";
  const q4 = "SELECT * FROM `kpi`JOIN anskpi ON kpi.kpiID= anskpi.kpiID WHERE kpi.solutionID=? ";
  
  try {
    db.query(q1, [cityID, solutionid], (err, data) => {
      if (err) return res.status(500).json(err);

      db.query(q2, [solutionid], (err, dataOld) => {
        if (err) return res.status(500).json(err);
        db.query(q3, (err, question) => {
          if (err) return res.status(500).json(err);
          db.query(q4,[solutionid],(err,kpi)=>{
            if(err) return res.status(500).json(err);
            if(kpi.length>0){
                res.render("form-smart", {
                kpiQ:kpi,//ok
                formdata: data,//may be ok
                dataOld: dataOld || [],//chnage structure
                csrfToken: req.csrfToken(),
                question: question,//ok
              });
            }
            else{
              const q5 = "SELECT * FROM `kpi` WHERE solutionID=?";
              db.query(q5, [solutionid], (err, kpi) => {
                if(err) return res.status(500).json(err);
                res.render("form-smart", {
                  kpiQ:kpi,
                  formdata: data,
                  dataOld: dataOld || [],
                  csrfToken: req.csrfToken(),
                  question: question,
                });
                
              });
            }
            // db.query(q5,[solutionid],(err,kpiOld)=>{
            //   if(err) return res.status(500).json(err);
            //   console.log(kpi)
            //   res.render("form-smart", {
            //     kpiOld:kpiOld,
            //     kpiQ:kpi,
            //     formdata: data,
            //     dataOld: dataOld || [],
            //     csrfToken: req.csrfToken(),
            //     question: question,
            //   });
            // })
              
          })
        });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

exports.getformSmartRound2 = (req, res, next) => {
  const solutionid = req.params.solutionID;
  const cityID = req.session.userID;
  const q1 =
    "SELECT * FROM solution JOIN smart ON solution.smartKey = smart.smartKey JOIN kpi ON kpi.solutionID = solution.solutionID JOIN city_home ON city_home.cityID = solution.cityID WHERE solution.cityID = ? AND solution.solutionID = ? ";
  const q2 = "SELECT * FROM anssolution2 WHERE solutionID = ?;";
  const q3 = "SELECT * FROM `question` WHERE 1";
  const q4 = "SELECT * FROM `kpi` JOIN anskpi ON kpi.kpiID = anskpi.kpiID WHERE kpi.solutionID = ?";
  const qData = "SELECT * FROM anssolution2_round2 WHERE solutionID = ?;";

  try {
    db.query(q1, [cityID, solutionid], (err, data) => {
      if (err) return res.status(500).json(err);

      db.query(q2, [solutionid], (err, dataOld) => {
        if (err) return res.status(500).json(err);

        db.query(q3, (err, question) => {
          if (err) return res.status(500).json(err);

          db.query(q4, [solutionid], (err, kpi) => {
            if (err) return res.status(500).json(err);

            db.query(qData, [solutionid], (err, dataRound2) => {
              if (err) return res.status(500).json(err);

              if (kpi.length > 0) {
                res.render("form-smart-round2", {
                  kpiQ: kpi,
                  formdata: data,
                  dataOld: dataOld || [],
                  dataOldRound2: dataRound2 || [],
                  csrfToken: req.csrfToken(),
                  question: question,
                });
              } else {
                const q5 = "SELECT * FROM `kpi` WHERE solutionID = ?";
                db.query(q5, [solutionid], (err, kpi) => {
                  if (err) return res.status(500).json(err);

                  res.render("form-smart-round2", {
                    kpiQ: kpi,
                    formdata: data,
                    dataOld: dataOld || [],
                    dataOldRound2: dataRound2 || [],
                    csrfToken: req.csrfToken(),
                    question: question,
                  });
                });
              }
            });
          });
        });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};



exports.postFormSmart = (req, res, next) => {
  try {
    console.log("insertform complete");

    const postData = req.body;
    const solutionParam = req.params;
    const qUpdateStatus = "UPDATE solution SET status = 1 WHERE solutionID = ?";
    let qInsert;
    let qUpdate;
    const qFetchData = "SELECT * FROM anssolution WHERE solutionID = ?";

    db.query(qFetchData, [solutionParam.solutionID], (err, fetchData) => {
      if (err)
        return res.status(500).json({ error: "FetchDataError", message: err });

      const numberOfQuestions = Object.keys(postData).filter((key) =>
        key.startsWith("Q")
      ).length;
      //ถ้าเจอ
      // console.log("จำนวนQ:",numberOfQuestions)
      if (fetchData && fetchData.length > 0) {
        // Update existing data
        qUpdate = `UPDATE anssolution SET timestamp = ?`;
        for (let i = 1; i <= numberOfQuestions; i++) {
          qUpdate += `, Q${i}=?`;
        }
        qUpdate += ` WHERE solutionID=?`;

        const updateParams = [postData.currentDateTime];
        for (let i = 1; i <= numberOfQuestions; i++) {
          updateParams.push(postData[`Q${i}`]); // Ensure all values are provided or set to null
        }

        updateParams.push(solutionParam.solutionID);
        db.query(qUpdate, updateParams, (err, updateData) => {
          if (err)
            return res.status(500).json({ error: "UpdateError", message: err });
          db.query(
            qUpdateStatus,
            [solutionParam.solutionID],
            (err, updateStatusData) => {
              if (err)
                return res
                  .status(500)
                  .json({ error: "UpdateStatusError", message: err });
              return res.redirect(
                `/formsmart/${req.params.solutionID}?success=true`
              );
            }
          );
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
          insertParams.push(postData[`Q${i}`]); // Ensure all values are provided or set to null
        }
        db.query(qInsert, insertParams, (err, insertData) => {
          if (err)
            return res
              .status(500)
              .json({ error: "InsertDataError", message: err });
          db.query(
            qUpdateStatus,
            [solutionParam.solutionID],
            (err, updateStatusData) => {
              if (err)
                return res
                  .status(500)
                  .json({ error: "UpdateStatusError", message: err });
              return res.redirect(
                `/formsmart/${req.params.solutionID}?success=true`
              );
            }
          );
        });
      }
    });
  } catch (err) {
    console.log(err);
    res 
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
};


exports.notification = (req, res, next) => {
  // ส่วนของ Token ที่ได้จากการสร้างของแอปไลน์ Notify
  const CityID = req.params.CityID;
  // const CityID=456

  const q = "SELECT`province` FROM `citydata` WHERE cityID=?";
  try{
  db.query(q, [CityID], (err, data) => {
    if (err) return res.status(500).json(err);
    const LINE_NOTIFY_TOKEN = "npl7B2crirxxrRoFmq3KFSNaR2xjGH4Ixn9G0KOUNDf";

    // ส่วนของข้อความที่ต้องการส่ง
    const message = "เมือง" + data[0].province + "ส่งฟรอมแล้วนะขอรับท่านพี่เค้ก";

    // URL ของ API สำหรับการส่งข้อความผ่าน Line Notify
    const LINE_NOTIFY_API_URL = "https://notify-api.line.me/api/notify";

    // ส่งข้อความผ่าน Line Notify API
    axios
      .post(LINE_NOTIFY_API_URL, `message=${message}`, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${LINE_NOTIFY_TOKEN}`,
        },
      })
      .then((response) => {
        console.log("Notification sent:", response.data);
        res.status(200).json({ message: "Notification sent successfully" });
      })
      .catch((error) => {
        console.error("Error sending notification:", error);
        res.status(500).json({ error: "Failed to send notification" });
      });
  });}
  catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

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
      const kpiKey = key.substring(solutionID.length + 1); // Extract KPI ID
      const kpiAnswer = req.body[key];
      const kpiID = kpiKey.split('-')[0]; // Extract the part before the dash
      kpiArray.push({ kpiID, kpiAnswer });
    }
  }

  // Check if the solutionID exists in the database
  const checkQuery = "SELECT * FROM `anssolution2` WHERE `solutionID` = ?";
  db.query(checkQuery, [solutionID], (err, rows) => {
    if (err) {
      console.error("Error checking existing data:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // If solutionID exists, update the row; otherwise, insert a new row
    if (rows.length > 0) {
      const updateQuery = "UPDATE `anssolution2` SET `timestamp` = ?, `ans` = ? WHERE `solutionID` = ?";
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
          return res.redirect(`/formsmart/${req.params.solutionID}?success=true`);
        });
      });
    } else {
      const insertQuery = "INSERT INTO `anssolution2`(`solutionID`, `timestamp`, `ans`) VALUES (?,?,?)";
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
          return res.redirect(`/formsmart/${req.params.solutionID}?success=true`);
        });
      });
    }
  });
};


exports.saveFormRound2 = (req, res, next) => {
  const dataArray = [];
  const kpiArray = [];
  const solutionID = req.params.solutionID;
  const qUpdate = "UPDATE solution SET status_round2 = 1 WHERE solutionID = ?";
  
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
  const checkQuery = "SELECT * FROM `anssolution2_round2` WHERE `solutionID` = ?";
  db.query(checkQuery, [solutionID], (err, rows) => {
    if (err) {
      console.error("Error checking existing data:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // If solutionID exists, update the row; otherwise, insert a new row
    if (rows.length > 0) {
      const updateQuery = "UPDATE `anssolution2_round2` SET `timestamp` = ?, `ans` = ? WHERE `solutionID` = ?";
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
          return res.redirect(`/formsmart/${req.params.solutionID}?success=true`);
        });
      });
    } else {
      const insertQuery = "INSERT INTO `anssolution2_round2`(`solutionID`, `timestamp`, `ans`) VALUES (?,?,?)";
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
          return res.redirect(`/formsmart/${req.params.solutionID}?success=true`);
        });
      });
    }
  });
};







