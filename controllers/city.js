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
          // Render the /follow page and pass cityInfo to the template
          res.render("city/dashboard", {
              pageTitle: "Dashboard",
              path: "/city",
              cityInfo: cityInfo[0] // Pass cityInfo to the template
          });
      })
      .catch((error) => {
          console.error(error);
          // Handle the error here
      });
};

exports.getCityFollow = (req, res, next) => {
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
          // Render the /follow page and pass cityInfo to the template
          res.render("city/follow", {
              pageTitle: "Follow",
              path: "/city",
              cityInfo: cityInfo[0] // Pass cityInfo to the template
          });
      })
      .catch((error) => {
          console.error(error);
          // Handle the error here
      });
};


exports.getCityUpload = (req, res, next) => {
  // Render the /upload page
  res.render("city/upload", {
    pageTitle: "Upload",
    path: "/city",
  });
};

exports.getCityForm = (req, res, next) => {
  // Render the /form page
  res.render("city/form", {
    pageTitle: "Upload Data",
    path: "/city",
  });
};

exports.getCityFormCdp = (req, res, next) => {
  // Render the /form page
  res.render("city/form-cdp", {
    pageTitle: "Upload Data Cdp",
    path: "/city",
  });
};



