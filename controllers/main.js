const db = require("../db.js");
const moment = require('moment'); //ใช้ในการคำนวณวันที่

// Display the Welcome Page
exports.getWelcomePage = (req, res, next) => {
  res.render("welcome", { req, pageTitle: "Welcome", path: "/welcome" });
};

// Display the Main Page
exports.getMainPage = (req, res, next) => {
  
  const q = "SELECT city_home.cityName, citydata.province, citydata.date FROM `city_home` JOIN citydata ON city_home.cityID = citydata.cityID ;"
  db.query(q,(err,data)=>{
    if(err) return res.status(500).json("queryError",err);

    const updatedData = data.map(item => {
      const announcementDate = moment(item.date);
      const currentDate = moment();
      const duration = moment.duration(currentDate.diff(announcementDate));
      const years = duration.years();
      const months = duration.months();
      const days = duration.days();
      return {
        ...item,
        years,
        months,
        days
      };
    });

    res.render("main", { req, 
      pageTitle: "", 
      path: "/home",
      fechdata:updatedData,
    });

  })
  
};
