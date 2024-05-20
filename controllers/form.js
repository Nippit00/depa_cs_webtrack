const db = require("../db.js");
const axios = require("axios");


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









