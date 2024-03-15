// **************
// **  Models  **
// **************
const City = require("../models/city");
const CityData = require("../models/cityData");

// ****************
// **  getCity   **
// ****************
exports.getCity = (req, res, next) => {
  const cityID = req.session.userID;

  // Define the aggregation pipeline
  const pipeline = [
    { $match: { cityID: cityID } },
    {
      $lookup: {
        from: "citydata",
        localField: "cityID",
        foreignField: "cityID",
        as: "citydata",
      },
    },
    { $limit: 1 },
  ];

  City.aggregate(pipeline)
    .then((cityInfo) => {
      console.log(cityInfo[0]);
      // Render the /city page
      res.render("city/city", {
        req,
        pageTitle: cityInfo[0].cityname,
        path: "/city",
        cityInfo: cityInfo[0],
      });
    })
    .catch((error) => {
      console.error(error);
    });
};

exports.getCityDashboard = (req, res, next) => {
  // Render the /dashboard page
  res.render("city/dashboard", {
    pageTitle: "Dashboard",
    path: "/city",
  });
};

exports.getCityFollow = (req, res, next) => {
  // Render the /follow page
  res.render("city/follow", {
    pageTitle: "Follow",
    path: "/city",
  });
};

exports.getCityUpload = (req, res, next) => {
  // Render the /upload page
  res.render("city/upload", {
    pageTitle: "Upload",
    path: "/city",
  });
};
