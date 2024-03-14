// Display the Welcome Page
exports.getWelcomePage = (req, res, next) => {
    res.render('welcome', {
        pageTitle: '',
        path: '/welcome',
    });
};

// Display the Main Page
exports.getMainPage = (req, res, next) => {
    res.render('main', {
        pageTitle: '',
        path: '/main',
    });
};