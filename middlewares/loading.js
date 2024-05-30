module.exports = (req, res, next) => {
    if (req.session.isLoggedIn) {
        res.locals.loading = true; // สร้างตัวแปร loading ใน res.locals ให้เป็น true
        next();
    } else {
        next(); // ให้ทำงานเมื่อ req.session.isLoggedIn เป็น false
    }
}
