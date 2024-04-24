// **************
// **  Models  **
// **************

exports.getAdPage = (req, res, next) => {
  res.render("admin/ad-main", {
    pageTitle: "Main",
    path: "/",
  });
};

exports.getAdCityP = (req, res, next) => {
    // console.log(cities)
    res.render("admin/ad-city/ad-city", {
      pageTitle: "City",
      path: "/",
      cities: cities,
    });
};

exports.getAdCityDataP = (req, res, next) => {
  const cityID = req.params.cityID;
  console.log(cityID);


     res.render('admin/ad-city/ad-cityData', {
          pageTitle: 'City',
          path: '/',
        //   city: city,
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
