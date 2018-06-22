const isLoggedIn = (req,res,next)=> {
    if(req.isAuthenticated())
        return next();
    req.flash('loginMsg','You need to be logged in first');
    res.redirect('/login');
}

const isAdmin = (req,res,next) => {
    if(req.user.isAdmin)
        return next();
    req.flash('homePgFail', `You don't have the Admin Rights.`);
    res.redirect('/');
}

const checkCorrectUser = (req,res,next) => {
    if(req.user.username == req.params.username)
        return next();
    req.flash('homePgFail', `You are not authorized to do that.`);
    res.redirect('/');
}
module.exports = {isLoggedIn, isAdmin, checkCorrectUser};