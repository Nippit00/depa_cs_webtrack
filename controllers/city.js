// ****************
// **  getCity   **
// ****************
exports.getCity = (req, res, next) => {
    // Render the /city page
    res.render('city/city', {
        pageTitle: 'City',
        path: '/city',
    });
};

exports.getCityDashboard = (req, res, next) => {
    // Render the /dashboard page
    res.render('city/dashboard', {
        pageTitle: 'Dashboard',
        path: '/city',
    });
};

exports.getCityFollow = (req, res, next) => {
    // Render the /follow page
    res.render('city/follow', {
        pageTitle: 'Follow',
        path: '/city',
    });
};

exports.getCityUpload = (req, res, next) => {
    // Render the /upload page
    res.render('city/upload', {
        pageTitle: 'Upload',
        path: '/city',
    });
};