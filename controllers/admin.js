// **************
// **  Models  **
// **************

exports.getAdPage = (req, res, next) => {
  res.render("admin/ad-main", {
    pageTitle: "Main",

  });
};

exports.getAdCityP = (req, res, next) => {
  
    // console.log(cities)
    res.render("admin/ad-city/ad-city", {
      pageTitle: "City",
      path: "/",
      
    });
  
};

exports.getAdCityDataP = (req, res, next) => {
  const cityID = req.params.cityID;
  console.log(cityID);

  
};
