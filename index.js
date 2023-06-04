'use strict'
require('dotenv').config();
const express = require('express')
const app = express();
const port = process.env.PORT || 3000;
const expressHandlerbars = require('express-handlebars')
const {createStarList} = require('./controllers/handlerbarsHelper');
const {createPagination} = require('express-handlebars-paginate');
const session = require('express-session');
const redisStore = require('connect-redis').default;
const {createClient} = require('redis');
const redisClient = createClient({
    // url: 'rediss://red-chu6hp5269vccp2pogt0:FYWZoKcd0Dyol1iqAzNqIohic1r9nTpD@oregon-redis.render.com:6379'
    // url: 'redis://red-chu6hp5269vccp2pogt0:6379'
    url: process.env.REDIS_URL
});
redisClient.connect().catch(console.error);
const passport = require('./controllers/passport');
const flash = require('connect-flash');

app.use(express.static(__dirname + '/public'))

app.engine('hbs', expressHandlerbars.engine({
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    extname: 'hbs',
    defaultLayout: 'layout',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true
    },
    helpers: {
        createStarList,
        createPagination
    }
}));

app.set('view engine', 'hbs');
// cau hinh doc du lieu post tu body
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// cau hinh su dung session
app.use(session({
    secret: process.env.SESSION_SECRET,
    store: new redisStore({client: redisClient}),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 20 * 60 * 1000 // 20ph
    }
}));

// cau hinh su dung passport
app.use(passport.initialize());
app.use(passport.session());

// cau hinh su dung connect-flash
app.use(flash());

//middleware
app.use((req, res, next) => {
    let Cart = require('./controllers/cart');
    req.session.cart = new Cart(req.session.cart ? req.session.cart : {});
    res.locals.quantity = req.session.cart.quantity;
    res.locals.isLoggedIn = req.isAuthenticated();
    next();
})

//routes
app.use('/', require('./routes/indexRouter'));
app.use('/products', require('./routes/productRouter'));
app.use('/users', require('./routes/authRouter'));  
app.use('/users', require('./routes/userRouter'));

app.use((req, res, next) => {
    res.status(404).render('error', {message: 'File not found!'});    
});

app.use((error, req, res, next) => {
    console.log(error);
    res.status(500).render('error', {message: 'Internal server error!'});
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})