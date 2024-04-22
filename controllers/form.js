exports.getform = (req, res, next) => {
    res.render("form", { req, pageTitle: "form"});
  };

exports.getformCdp = (req, res, next) => {
    res.render("form-cdp", { req, pageTitle: "form"});
  };
