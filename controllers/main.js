const db = require("../db.js");
const moment = require('moment'); //ใช้ในการคำนวณวันที่

// Display the Welcome Page
exports.getWelcomePage = (req, res, next) => {
  res.render("welcome", { req, pageTitle: "Welcome", path: "/welcome" });
};

// Display the Main Page
exports.getMainPage = (req, res, next) => {
  const queryCities = "SELECT  citydata.cityID,  city_home.cityName, citydata.province, citydata.date FROM `city_home` JOIN citydata ON city_home.cityID = citydata.cityID";
  const queryAvgProgress = "SELECT cityID, AVG(Progress) AS AvgProgress FROM solution GROUP BY cityID";

  // Query city information
  db.query(queryCities, (err, citiesData) => {
      if (err) {
          return res.status(500).json({ error: "queryError", message: err.message });
      }

      // Query average progress per city
      db.query(queryAvgProgress, (err, progressData) => {
          if (err) {
              return res.status(500).json({ error: "queryError", message: err.message });
          }
          // console.log(progressData)
          // Process date data for cities
          const updatedCitiesData = citiesData.map(city => {
              const announcementDate = moment(city.date);
              const currentDate = moment();
              const duration = moment.duration(currentDate.diff(announcementDate));
              return {
                  ...city,
                  years: duration.years(),
                  months: duration.months(),
                  days: duration.days()
              };
          });

          // Combine city data with their average progress
          const combinedData = updatedCitiesData.map(city => {
            // console.log(city)
              const cityProgress = progressData.find(p => p.cityID === city.cityID);
              return {
                  ...city,
                  averageProgress: cityProgress ? cityProgress.AvgProgress.toFixed(0) : 0  // Format average progress to 2 decimal places
              };
          });

          res.render("main", {
              req,
              pageTitle: "City Overview",
              path: "/home",
              fetchData: combinedData,
          });
      });
  });
};