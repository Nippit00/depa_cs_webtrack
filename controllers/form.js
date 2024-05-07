const db = require("../db.js");
const axios = require("axios");

exports.getform = (req, res, next) => {
  res.render("form", { req, pageTitle: "form" });
};

exports.getformGdpFirst = (req, res, next) => {
  res.render("form-cpdPart1", { req, pageTitle: "form" });
};

exports.postFormcheck = (req, res, next) => {
  console.log(req.body);
  const dataCheck = req.body;
  const q =
    "SELECT * FROM anssolution JOIN solution ON anssolution.solutionID = solution.solutionID JOIN city_home ON solution.cityID = city_home.cityID WHERE anssolution.solutionID = ?";
  const id = req.params.solutionID;
  db.query(q, id, (err, data) => {
    if (err) return res.status(500).json(errformcheck, err);
    res.render("formcheck", {
      req,
      pageTitle: "form",
      data: data[0],
      dataCheck: dataCheck,
    });
  });
};

exports.comfirmFormcheck = (req, res, next) => {
  try {
    console.log("insertform complete");
    const postData = req.body;
    const solutionParam = req.params;
    const qUpdateStatus = "UPDATE solution SET status = 2 WHERE solutionID = ?";
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
          if(i!==3){
            qUpdate += `, Q${i}=?`;
          }
            
        }
        qUpdate += ` WHERE solutionID=?`;

        const updateParams = [postData.currentDateTime];
        for (let i = 1; i <= numberOfQuestions; i++) {
            if(i!==3){
              updateParams.push(postData[`Q${i}`]); // Ensure all values are provided or set to null
            }
        }

        updateParams.push(solutionParam.solutionID);
        console.log("command:", qUpdate);
        console.log("Update Param:", updateParams);
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
                 
                
                  const q = "SELECT citydata.province,solution.solutionName FROM `solution` JOIN citydata ON solution.cityID=citydata.cityID WHERE solution.solutionID=?";
                  try{
                  db.query(q, [solutionParam.solutionID], (err, data) => {
                    console.log(data)
                    if (err) return res.status(500).json(err);
                    const LINE_NOTIFY_TOKEN = "npl7B2crirxxrRoFmq3KFSNaR2xjGH4Ixn9G0KOUNDf";
                
                    // ส่วนของข้อความที่ต้องการส่ง
                    const message = "จังหวัด" + data[0].province +data[0].solutionName +  "ส่งฟรอมแล้วนะขอรับท่านพี่เค้ก";
                
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
                      .catch((error) => {
                        console.error("Error sending notification:", error);
                        res.status(500).json({ error: "Failed to send notification" });
                      });
                  });}
                  catch (err) {
                    console.log(err);
                    res.status(500).json(err);
                  }
              return res.json({"status":"ok"})
            }
          );
        });
        //ถ้าไม่เจอ
      } else {
        // Insert new data
        qInsert = `INSERT INTO anssolution (solutionID, timestamp`;
        for (let i = 1; i <= numberOfQuestions; i++) {
          if(i!==3){
            qInsert += `, Q${i}`;
          }
        }
        qInsert += `) VALUES (?,?`;
        for (let i = 1; i <= numberOfQuestions; i++) {
          if(i!==3){
            qInsert += `,?`;
          }
        }
        qInsert += `)`;

        const insertParams = [
          solutionParam.solutionID,
          postData.currentDateTime,
        ];
        for (let i = 1; i <= numberOfQuestions; i++) {
          if(i!==3){
            insertParams.push(postData[`Q${i}`]); // Ensure all values are provided or set to null
          }
        }
        console.log("Q Insert :", qInsert);
        console.log("insertParams:", insertParams);
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
              return res.json({"status":"ok"})
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

exports.getformSmart = (req, res, next) => {
  const solutionid = req.params.solutionID;
  const cityID = req.session.userID;
  const q1 =
    "SELECT * FROM solution JOIN smart ON solution.smartKey = smart.smartKey JOIN kpi ON kpi.solutionID = solution.solutionID JOIN city_home ON city_home.cityID = solution.cityID WHERE solution.cityID = ? AND solution.solutionID = ? ";
  const q2 = "SELECT * FROM anssolution WHERE solutionID = ?;";
  const q3 = "SELECT * FROM `question` WHERE 1";
  try {
    db.query(q1, [cityID, solutionid], (err, data) => {
      if (err) return res.status(500).json(err);

      db.query(q2, [solutionid], (err, dataOld) => {
        if (err) return res.status(500).json(err);
        db.query(q3, (err, question) => {
          if (err) return res.status(500).json(err);
          res.render("form-smart", {
            formdata: data,
            dataOld: dataOld || [],
            csrfToken: req.csrfToken(),
            question: question,
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
        console.log("command:", qUpdate);
        console.log("Update Param:", updateParams);
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
        console.log("Q Insert :", qInsert);
        console.log("insertParams:", insertParams);
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
    console.log(data)
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

exports.getformCdp2 = (req, res, next) => {
  const solutionid = req.params.solutionID;
  const cityID = req.session.userID;
  const q1 =
    "SELECT * FROM solution JOIN smart ON solution.smartKey = smart.smartKey JOIN kpi ON kpi.solutionID = solution.solutionID JOIN city_home ON city_home.cityID = solution.cityID WHERE solution.cityID = ? AND solution.solutionID = ? ";
  const q2 = "SELECT * FROM anssolution WHERE solutionID = ?;";
  const q3 = "SELECT * FROM `question` WHERE 1";
  try {
    db.query(q1, [cityID, solutionid], (err, data) => {
      if (err) return res.status(500).json(err);

      db.query(q2, [solutionid], (err, dataOld) => {
        if (err) return res.status(500).json(err);
        db.query(q3, (err, question) => {
          if (err) return res.status(500).json(err);
          res.render("form-cdp2", {
            formdata: data,
            dataOld: dataOld || [],
            csrfToken: req.csrfToken(),
            question: question,
          });
        });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};
