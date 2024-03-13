// Display the Main Page
exports.getMainPage = (req, res, next) => {
    res.render('main', {
        pageTitle: '',
        path: '/main',
    });
};