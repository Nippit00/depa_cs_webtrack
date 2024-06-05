const axios = require("axios");
const cron = require("node-cron");
const db = require("../db.js");

// Function to send notification
const sendNotification = () => {
  const CityID = '6201ECO01';
  const q = "SELECT citydata.province, solution.solutionName FROM `solution` JOIN citydata ON solution.cityID = citydata.cityID WHERE solution.solutionID = ?";

  db.query(q, [CityID], (err, data) => {
    if (err) {
      console.error("Database query error:", err);
      return;
    }

    const LINE_NOTIFY_TOKEN = "npl7B2crirxxrRoFmq3KFSNaR2xjGH4Ixn9G0KOUNDf";
    const message = "จังหวัด" + data[0].province + data[0].solutionName + "เทส";
    const LINE_NOTIFY_API_URL = "https://notify-api.line.me/api/notify";

    axios.post(LINE_NOTIFY_API_URL, `message=${message}`, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${LINE_NOTIFY_TOKEN}`,
      },
    })
    .then((response) => {
      console.log("Notification sent:", response.data);
    })
    .catch((error) => {
      console.error("Error sending notification:", error);
    });
  });
};

// Schedule the cron job to run every minute
// cron.schedule('* * * * *', () => {
//   console.log('Running cron job to send notification');
//   sendNotification();
// });

// Express route handler for manual trigger
exports.notification = (req, res, next) => {
  sendNotification();
  res.status(200).json({ message: "Notification sent successfully" });
};

// Initialize your express app and routes here
const express = require('express');
const app = express();

