// **************
// **  Models  **
// **************
const City = require("../models/city");
const CityData = require("../models/cityData");

exports.getAdPage = (req, res, next) => {
  res.render("admin/ad-main", {
    pageTitle: "Main",
    path: "/",
  });
};

exports.getAdCityP = (req, res, next) => {
  City.find({}).then((cities) => {
    // console.log(cities)
    res.render("admin/ad-city/ad-city", {
      pageTitle: "City",
      path: "/",
      cities: cities,
    });
  });
};

exports.getAdCityDataP = (req, res, next) => {
  const cityID = req.params.cityID;
  console.log(cityID);

  // Define the aggregation pipeline
  const pipeline = [
    {
      $lookup: {
        from: "citydata",
        localField: "cityID", 
        foreignField: "cityID", 
        as: "citydata", 
      },
    },
    {
      $unwind: "$orders",
    },
    // Add more stages for filtering or data manipulation as needed
  ];

  CityData.findOne({cityID: cityID}).then(citydata =>{
    console.log(citydata)
  }
  )

  City.aggregate(pipeline)
  .then(cityDataA => {
    // Process the joined data (users with their respective orders)
    console.log(cityDataA)


     res.render('admin/ad-city/ad-cityData', {
          pageTitle: 'City',
          path: '/',
        //   city: city,
      });
  })
  .catch(error => {
    console.error(error);
  });

//   City.findOne({ cityID: cityID });

  // .then(city  => {
  //     console.log(city)

  //     res.render('admin/ad-city/ad-cityData', {
  //         pageTitle: 'City',
  //         path: '/',
  //         city: city,
  //     });
  // })
};
