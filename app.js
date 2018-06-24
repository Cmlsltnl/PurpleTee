const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
const MongoStore = require('connect-mongo')(session);

const app = express();

const passport = require('./passport');
const db = require('./db');

const models = require('./models');

const CONFIG = require('./config');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));
app.set('view engine', 'ejs');

app.use(flash());
app.use(cookieParser(CONFIG.COOKIE_SECRET_KEY));
app.use(session({
    secret: CONFIG.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: db.connection })
}));

app.use(passport.initialize());
app.use(passport.session());


app.use((req, res, next)=>{
    res.locals.user= req.user;
    next();
});

app.use('/', require('./routes'));

app.get('/shelly', (req,res)=>{
    res.render('shelly');
})
app.get('*', (req,res)=>{
    res.render('notExist');
})

app.listen(CONFIG.SERVER.PORT, ()=>{
    console.log(`Server Started at http://localhost:${CONFIG.SERVER.PORT}/`);
})