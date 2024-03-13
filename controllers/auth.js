
// ****************
// **  getLogin  **
// ****************
exports.getLogin = (req, res, next) => {
    // Render the /login page
    res.render('auth/login', {
        pageTitle: 'Authentication',
        path: '/login',
    });
};