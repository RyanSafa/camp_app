const express = require ('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const path = require('path');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const { join } = require('path');
const Review = require('./models/review')
const Campground = require('./models/campground');
const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const review = require('./models/review');
const reviewRoutes = require('./routes/reviews');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
const sessionConfig = {
    secret: '123',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: (1000 * 60 * 60 * 24 * 7)
    }
}
app.use(session(sessionConfig));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.engine('ejs', ejsMate);
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) =>{
    res.locals.success = req.flash('success'); //.locals means that all our templates have access to success
    res.locals.error = req.flash('error')
    next()
})

app.get('/makeUser', async(req,res) => {
    const user = new User({email: "example@gmail.com", username: "Ryan"});
    const newUser = await User.register(user, "123");
    res.send(newUser);
});


app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.get('/', (req,res) => {
    res.render('home');
});

app.all('*', (req,res,next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err,req,res,next) =>{
    const { statusCode = 500} = err;
    if(!err.message) err.message = "Oh no, something went wrong!"
    res.status(statusCode).render('error', {err});
});

app.listen(3000, () =>{
    console.log("Listening on Port 3000");
});