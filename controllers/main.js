// Display the Welcome Page
exports.getWelcomePage = (req, res, next) => {
  res.render("welcome", { req, pageTitle: "", path: "/welcome" });
};

// Display the Main Page
exports.getMainPage = (req, res, next) => {
  res.render("main", { req, pageTitle: "", path: "/home" });
};
