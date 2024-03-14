// **************
// **  Models  **
// **************
const city = require("../models/city");
const CityData = require("../models/cityData");

// ***************
// **  Modules  **
// ***************
const bcrypt = require('bcryptjs');


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


// *****************
// **  postLogin  **
// *****************
exports.postLogin = (req, res, next) => {
    // Get the user's inputs: username & password
    const username = req.body.username;
    const password = req.body.password;
    console.log(req.body)

    CityData.findOne({username: username})
    .then(cityData => {
        console.log(cityData)
        if (!cityData) {
            // This username is not founded
            return res.redirect('/login');
        }

        if(cityData.password == password){
             // If the password is matched
                        // Update the session .isLoggedIn and .user
                        req.session.isLoggedIn = true;
                        req.session.user = cityData;
                        // Save the session
                        return req.session.save(err => {
                            if (err) {
                                // If there is an error, redirect to /login page
                                console.log(err)
                                req.flash('alert', 'invalid login')
                                return res.redirect('/login');
                            }
                            res.redirect('/city');
                        })
        }
        else{
            return res.redirect('/login');
        }
    })


    

};