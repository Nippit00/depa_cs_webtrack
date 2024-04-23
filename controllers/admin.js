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

};

exports.getAdCityDataP = (req, res, next) => {


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
