const db = require("../db.js");
const moment = require('moment'); //ใช้ในการคำนวณวันที่

// ****************
// **  getCity   **
// ****************
exports.GetCity = (req, res) => {
  const cityID = req.session.userID;
  const qCityData =
    "SELECT * FROM citydata JOIN city_home ON citydata.cityID = city_home.cityID WHERE citydata.cityID = ?";
  const qSolution =
    "SELECT `smartKey` FROM `solution` WHERE cityID=? ";
  const qCityFile =
    "SELECT * FROM cityfile WHERE cityfile.cityID = ?";
  const qProvince="SELECT city_home.cityName FROM `citydata`JOIN `city_home` ON `citydata`.`cityID` = `city_home`.`cityID`WHERE `citydata`.`province` = ? AND `citydata`.`cityID` != ?;"
  const qRound = `
    SELECT * FROM round 
    JOIN citydata ON round.Date = citydata.date 
    WHERE cityID=?
  `
  try {
    db.query(qCityData, [cityID], (err, cityData) => {
      if (err) return res.status(500).json(err);
      const announcementDate = moment(cityData[0].date);
      const currentDate = moment();
      const duration = moment.duration(currentDate.diff(announcementDate));
      const years = duration.years();
      const months = duration.months();
      const days = duration.days();
      const totalDays = currentDate.diff(announcementDate, 'days'); //นับวันทั้งหมด
      const twoYearsLater = announcementDate.clone().add(2, 'years'); //นับจากวันที่ประกาศไป2ปี
      const twoYearsLaterFormatted = twoYearsLater.format('DD/MM/YYYY');
      db.query(qSolution, [cityID], (err, solutionData) => {
        if (err) return res.status(500).json(err);

        const smartKeyCounts =  { 'ENE': 0, 'ENV': 0, 'GOV': 0, 'ECO': 0, 'LIV': 0, 'MOB': 0, 'CDP': 0,'PEO':0  };
        solutionData.forEach(row => {
          if (smartKeyCounts[row.smartKey]) {
            smartKeyCounts[row.smartKey]++;
          } else {
            smartKeyCounts[row.smartKey] = 1;
          }
        });

        db.query(qCityFile, [cityID], (err, cityFileData) => {
          if (err) return res.status(500).json(err);

          db.query(qProvince,[cityData[0].province,cityData[0].cityID],(err,province)=>{
          if (err) return res.status(500).json(err);
            db.query(qRound,[cityID],(err,dataRound)=>{
              if (err) return res.status(500).json(err);

              // console.log(dataRound)
              res.render("city/city", {
                req,
                pageTitle: cityData[0].cityname,
                path: "/city",
                cityInfo: cityData[0],
                citysolution: solutionData,
                smartKeyCounts: smartKeyCounts,// ส่งจำนวน smart key แต่ละตัวในออบเจกต์ไปยัง view
                datafile: cityFileData,
                announcementDuration: { years, months, days, totalDays, twoYearsLaterFormatted },
                province:province,
                dataRound:dataRound,
              });
            })
          })
              


        });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};



exports.getCityDashboard = (req, res, next) => {
  const cityID = req.session.userID;
  const q = `
    SELECT * FROM solution
    JOIN smart ON solution.smartKey = smart.smartKey
    JOIN kpi ON kpi.solutionID = solution.solutionID
    JOIN citydata ON citydata.cityID = solution.cityID
    JOIN city_home ON city_home.cityID = solution.cityID
    WHERE solution.cityID = ?
    GROUP BY solution.solutionID;
  `;
  const qGetvalue = `
    SELECT * FROM anssolution
    JOIN solution ON anssolution.solutionID = solution.solutionID
    WHERE solution.cityID = ?;
  `;
  const qGetprogress = `
    SELECT * FROM solution
    JOIN anssolution ON solution.solutionID = anssolution.solutionID
    WHERE solution.cityID = ?;
  `;
  const qSmartKey = `
  SELECT smartKey,solutionName FROM solution 
  WHERE cityID=? `;

  try {
    db.query(q, [cityID], (err, data) => {
      if (err) return res.status(500).json(err);

      const dataUpdate = data.map((row) => {
        return {
          ...row,
          status: JSON.parse(row.status),
        };
      });

      db.query(qGetvalue, [cityID], (err, value) => {
        if (err) return res.status(500).json(err);

        db.query(qGetprogress, [cityID], (err, dataProgress) => {
          if (err) return res.status(500).json(err);

          db.query(qSmartKey,[cityID],(err,dataSmartkey)=>{
            if (err) return res.status(500).json(err);

            if (dataProgress.length === 0) {
              const rounded = {};
              const smartKeyCounts = {};
              const problemPercentages = [];
              const successfulProjectsData = Array(8).fill(0);
              let unsuccessfulProjectsData = [];
  
              const averageProgressPerSmartKey = {
                ENE: "0",
                ENV: "0",
                GOV: "0",
                ECO: "0",
                LIV: "0",
                MOB: "0",
                CDP: "0",
              };
  
              dataSmartkey.forEach((row) => {
                if (smartKeyCounts[row.smartKey]) {
                  smartKeyCounts[row.smartKey]++;
                } else {
                  smartKeyCounts[row.smartKey] = 1;
                }
              });
              const count = Object.values(smartKeyCounts).reduce(
                (acc, value) => acc + value,
                0
              );
  
              unsuccessfulProjectsData = Object.values(smartKeyCounts);
  
              rounded["1"] = {
                count: count,
                complete: [],
                progress: 0,
                success: successfulProjectsData,
                unsuccess: unsuccessfulProjectsData,
                problem: problemPercentages,
                smartkeycount: smartKeyCounts,
                averageProgressPerSmart: averageProgressPerSmartKey,
              };
              
  
              res.render("city/dashboard", {
                req,
                pageTitle: "Dashboard",
                path: "/city",
                solutionInfo: JSON.stringify(dataUpdate),
                data: data,
                valueInfo: value,
                rounded: JSON.stringify(rounded),
              });
              return;
            }
  
            const maxRound = Math.max(...dataProgress.map((row) => row.Round));
            const rounded = {};
  
            for (let round = 1; round <= maxRound; round++) {
              const roundData = dataProgress.filter((row) => row.Round == round);
              const smartKeyCounts = {};
              const projectSuccess = [];
              const successfulProjectsData = Array(8).fill(0);
              let unsuccessfulProjectsData = Array(8).fill(0);
  
              const validProblems = dataProgress.filter(
                (row) => row.questionID == 5 && row.ans !== "null" && row.Round == round
              );
              const totalProblems = validProblems.length;
              const problemCounts = {};
  
              validProblems.forEach((row) => {
                if (problemCounts[row.ans]) {
                  problemCounts[row.ans]++;
                } else {
                  problemCounts[row.ans] = 1;
                }
              });
  
              const problemPercentages = Object.keys(problemCounts).map((key) => {
                return {
                  problem: key,
                  percentage: ((problemCounts[key] / totalProblems) * 100).toFixed(2),
                };
              });
  
              dataSmartkey.forEach((row) => {
                if (smartKeyCounts[row.smartKey]) {
                  smartKeyCounts[row.smartKey]++;
                } else {
                  smartKeyCounts[row.smartKey] = 1;
                }
              });
  
              const count = Object.values(smartKeyCounts).reduce(
                (acc, value) => acc + value,
                0
              );
  
              const smartKeyProgress = {};
              const smartKeyCountsForAverage = {};
              let totalSum = 0;
              let totalCount = 0;
  
              roundData.forEach((item) => {
                if (item.questionID == 2) {
                  item.ans = parseInt(item.ans, 10);
                  totalSum += item.ans;
                  totalCount += 1;
  
                  if (smartKeyProgress[item.smartKey]) {
                    smartKeyProgress[item.smartKey] += item.ans;
                    smartKeyCountsForAverage[item.smartKey] += 1;
                  } else {
                    smartKeyProgress[item.smartKey] = item.ans;
                    smartKeyCountsForAverage[item.smartKey] = 1;
                  }
  
                  if (item.ans == 100) {
                    projectSuccess.push(item.solutionName);
                    successfulProjectsData[
                      Object.keys(smartKeyCounts).indexOf(item.smartKey)
                    ]++;
                  }
                }
              });
  
              const smartKeyCountsValues = Object.values(smartKeyCounts);
              unsuccessfulProjectsData = smartKeyCountsValues.map(
                (value, index) => value - successfulProjectsData[index]
              );
  
              const averageProgressPerSmartKey = {
                ENE: "0",
                ENV: "0",
                GOV: "0",
                ECO: "0",
                LIV: "0",
                MOB: "0",
                CDP: "0",
              };
  
              Object.keys(smartKeyProgress).forEach((key) => {
                averageProgressPerSmartKey[key] = (
                  smartKeyProgress[key] / smartKeyCountsForAverage[key]
                ).toFixed(2);
              });
  
              const totalAverage = (totalSum / count).toFixed(2);
              rounded[round] = {
                count: count,
                complete: projectSuccess,
                progress: totalAverage,
                success: successfulProjectsData,
                unsuccess: unsuccessfulProjectsData,
                problem: problemPercentages,
                smartkeycount: smartKeyCounts,
                averageProgressPerSmart: averageProgressPerSmartKey,
              };
              // console.log(rounded)
            }
            res.render("city/dashboard", {
              req,
              pageTitle: "Dashboard",
              path: "/city",
              solutionInfo: JSON.stringify(dataUpdate),
              data: data,
              valueInfo: value,
              rounded: JSON.stringify(rounded),
            });
          })
        });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

exports.getCityFollow = (req, res, next) => {
  const cityID = req.session.userID;
  const q = "SELECT * FROM solution JOIN smart ON solution.smartKey = smart.smartKey JOIN kpi ON kpi.solutionID = solution.solutionID JOIN city_home ON city_home.cityID = solution.cityID WHERE solution.cityID = ? AND solution.status_solution=1 GROUP BY solution.solutionName ORDER BY solution.solutionID ASC";
  const qRound = "SELECT * FROM citydata JOIN round ON citydata.date = round.Date WHERE citydata.cityID = ?"
  try {
    db.query(q, [cityID], (err, data) => {
      if (err) return res.status(500).json(err);
      // console.log("Check follow data :",data)
      const followdata = data.map(row => {
        return {
          ...row,
          status: JSON.parse(row.status)
        };
      });
      
      db.query(qRound,[cityID],(err,dataRound)=>{
        console.log(dataRound)
        if (err) return res.status(500).json(err);
        res.render("city/follow", {
          pageTitle: "Follow",
          path: "/city",
          followdata: followdata || [],
          dataRound:dataRound[0],
        });
      })
    });

  } catch (err) {
    console.log(err);
    res.status(500).json(err)
  }
};

exports.getCityUpload = (req, res, next) => {
  // Render the /upload page
  res.render("city/upload", {
    pageTitle: "Upload",
    path: "/city",
  });
};

exports.getHistory = (req, res, next) => {
  q = "SELECT * FROM `Login_log` WHERE cityID = ?";
  // console.log(req.session.cityID)
  db.query(q, [req.session.userID], (err, data) => {
    if (err) return res.status(500).json(err);
    res.render("city/history-log", {
      pageTitle: "History",
      path: "/",
      data: data,
    });
  });
}