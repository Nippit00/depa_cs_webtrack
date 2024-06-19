const axios = require("axios");
const cron = require("node-cron");
const db = require("../db.js");
const moment = require('moment');

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

exports.postnotification = (req, res, next) => {
  try {
    const cityid = req.body.cityID;
    const q = "SELECT * FROM solution JOIN citydata ON solution.cityID = citydata.cityID WHERE solution.cityID = ?";

    db.query(q, [cityid], (err, dataSolution) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (dataSolution.length === 0) {
        return res.status(404).json({ error: 'No data found for the given city ID' });
      }

      const totalRows = dataSolution.length;
      const status0Count = dataSolution.filter(row => row.status === 0).length;
      const percentage = ((status0Count / totalRows) * 100).toFixed(2);

      const province = dataSolution[0].province || 'ไม่ทราบจังหวัด';
      const message = `จังหวัด ${province} ยังไม่ได้กรอกแบบฟอร์ม ${percentage}%`;

      if (!message.trim()) {
        console.error('Message is empty or invalid');
        return res.status(400).json({ error: 'Message is empty or invalid' });
      }

      const LINE_NOTIFY_TOKEN = "npl7B2crirxxrRoFmq3KFSNaR2xjGH4Ixn9G0KOUNDf";
      const LINE_NOTIFY_API_URL = "https://notify-api.line.me/api/notify";

      axios.post(LINE_NOTIFY_API_URL, `message=${encodeURIComponent(message)}`, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${LINE_NOTIFY_TOKEN}`,
        },
      })
      .then((response) => {
        console.log("Notification sent:", response.data);
        res.status(200).json({ message: 'Notification sent successfully' });
      })
      .catch((error) => {
        console.error("Error sending notification:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error sending notification' });
      });
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Unexpected error' });
  }
};


// Initialize your express app and routes here
const express = require('express');
const app = express();

