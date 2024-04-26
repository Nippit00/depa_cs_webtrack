// **************
// **  Models  **
// **************
const db = require("../db.js");
const bcrypt = require("bcrypt");
exports.getAdPage = (req, res, next) => {
  res.render("admin/ad-main", {
    pageTitle: "Main",
    path: "/",
  });
};

exports.getAddUserPage = (req, res, next) => {
  res.render("admin/ad-city/ad-addUser", {
    pageTitle: "add",
    path: "/",
  });
};
//get city ad-city
exports.getAdCityP = (req, res, next) => {
  const q =
    "SELECT `cityID`, `province`, `date`, `developer`, `executive`, `government_investment`, `private_investment`,`LAT`, `LNG` FROM `citydata` WHERE 1";
  try {
    db.query(q, (err, data) => {
      if (err) return res.status(500).json(err);
      console.log(data);
      res.render("admin/ad-city/ad-city", {
        req,
        pageTitle: "Dashboard",
        path: "/city",
        cityData: data,
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

exports.getAdCityDataP = (req, res, next) => {
  console.log(req.params);
  const q =
    "SELECT * FROM citydata JOIN city_home ON citydata.cityID = city_home.cityID WHERE citydata.cityID = ?;";
  const q2 =
    "SELECT * FROM `solution` JOIN smart ON solution.smartKey = smart.smartKey JOIN kpi on kpi.solutionID=solution.solutionID WHERE solution.cityID=? GROUP BY solution.solutionName";
  try {
    db.query(q, [req.params.cityID], (err, data) => {
      if (err) return res.status(500).json(err);
      console.log("Data is:", data);
      db.query(q2, [req.params.cityID], (errer, solution) => {
        if (err) return res.status(500).json(errer);
        // console.log("solution is:",solution)
        res.render("admin/ad-city/ad-citydata", {
          req,
          pageTitle: "Dashboard",
          path: "/city",
          cityData: data[0],
          solution: solution,
        });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

exports.getAddCity = (req, res, next) => {
  res.render("admin/ad-city/ad-addCity", {
    pageTitle: "add",
    path: "/",
    success: false,
  });
};
exports.postAddCity = (req, res, next) => {
  const {
    cityID,
    province,
    cityName,
    date,
    developer,
    executive,
    government_investment,
    private_investment,
    username,
    password,
    password2,
    LAT,
    LNG,
  } = req.body;

  // ใช้ bcrypt เพื่อเข้ารหัส password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error hashing password:", err);
      return res.status(500).send("Internal Server Error");
    }

    // ทำสิ่งที่ต้องการด้วย hashedPassword ที่เข้ารหัสแล้ว
    console.log("Hashed Password:", hashedPassword);

    // เตรียมข้อมูลสำหรับการเพิ่มเข้าฐานข้อมูล
    const cityData = {
      cityID,
      province,
      date,
      developer,
      executive,
      government_investment,
      private_investment,
      username,
      password: hashedPassword, // ใช้รหัสที่เข้ารหัสแล้ว
      LAT,
      LNG,
    };

    // เพิ่มข้อมูลลงในตาราง citydata
    db.query("INSERT INTO citydata SET ?", cityData, (error, result) => {
      if (error) {
        console.error("Error inserting city data:", error);
        return res.status(500).send("Internal Server Error");
      }
      console.log("City data added successfully");

      // เตรียมข้อมูลสำหรับการเพิ่มข้อมูลลงในตาราง city_home
      const cityHomeData = {
        cityID,
        cityName,
      };

      // เพิ่มข้อมูลลงในตาราง city_home
      db.query(
        "INSERT INTO city_home SET ?",
        cityHomeData,
        (homeError, homeResult) => {
          if (homeError) {
            console.error("Error inserting city home data:", homeError);
            return res.status(500).send("Internal Server Error");
          }
          console.log("City home data added successfully");

          // ตอบกลับหลังจากทำการเพิ่มข้อมูลทั้งสองตารางแล้ว
          // res.status(200).redirect("admin/ad-city/ad-addCity?success=true");
          // res.status(200).send("succesfully");
          res.render("admin/ad-city/ad-addCity", {
            pageTitle: "add",
            path: "/",
            success: true,
          });
        }
      );
    });
}});

exports.getEditProvince=(req,res,next)=> {
  console.log(req.params);
  const q ="SELECT citydata.cityID, citydata.province, citydata.date, citydata.developer, citydata.executive, citydata.government_investment, citydata.private_investment, citydata.LAT, citydata.LNG FROM citydata JOIN city_home ON citydata.cityID = city_home.cityID WHERE citydata.cityID = ?;";
    try {
    db.query(q, [req.params.cityID], (err, data) => {
      if (err) return res.status(500).json(err);
      console.log("Data is:", data);
        res.render("admin/ad-city/ad-editCity", {
          req,
          pageTitle: "Dashboard",
          path: "/city",
          cityData: data[0],
          success: false
        });
      
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};
exports.postUpdateProvince = (req, res, next) => {
  const cityID = req.params.cityID;
  const newData = req.body;
  delete newData._csrf;
  // SQL query for updating data
  const query = "UPDATE citydata SET ? WHERE cityID = ?";
  
  // Execute the query
  db.query(query, [newData, cityID], (err, result) => {
      if (err) {
          console.error("Error updating data:", err);
          return res.status(500).json({ error: "An error occurred while updating data" });
      }
      console.log("Data updated successfully");
      //fix later
      exports.getAdCityDataP(req, res, next);
  });
};

exports.getAddSolutionPage=(req,res,next)=>{
  console.log(req.params)
  res.render("admin/ad-city/ad-addsolution", {
    pageTitle: "add",
    path: "/",
    success: true,
    cityID:req.params.cityID,
  });
}

exports.postAddSolution = (req, res, next) => {
  const { cityID, solutionID,solutionName, smart, sourceFunds, funds, startYear, endYear, status } = req.body;
  
  let smartKey;
  switch (smart) {
      case 'Environment':
          smartKey = 'ENV'; // สมมติว่า 'ENV' คือค่าที่สมบูรณ์กับ 'Environment'
          break;
      case 'Energy':
          smartKey = 'ENE';
          break;
      case 'Economy':
          smartKey = 'ECO';
          break;
      case 'Governance':
          smartKey = 'GOV';
          break;
      case 'Living':
          smartKey = 'LIV';
          break;
      case 'Mobility':
          smartKey = 'MOB';
          break;
      case 'People':
          smartKey = 'PEO';
          break;
      default:
          smartKey = 'OTH'; // สมมติว่า 'OTH' คือค่าที่สมบูรณ์กับ 'Others' หรือค่าที่ไม่เข้าข่ายข้างต้น
          break;
  }
  const q="INSERT INTO `solution`(`cityID`, `smartKey`, `solutionID`, `solutionName`, `Source_funds`, `funds`, `start_year`, `end_year`, `status`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  db.query(q,[cityID, smartKey, solutionID, solutionName, sourceFunds, funds, startYear, endYear, status],
    (err, result) => {
        if (err) {
            console.error("Error adding solution:", err);
            res.status(500).json({ error: "Error adding solution" });
        } else {
            console.log("Solution added successfully");
            res.status(200).json({ message: "Solution added successfully" });
        }
    }
);

  
};
