const express = require ('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const path = require('path');
const ejsMate = require('ejs-mate')
const  { campgroundSchema } = require('./schemas.js')
const ExpressError = require('./utils/ExpressError')
const catchAsync = require('./utils/catchAsync')
const Campground = require('./models/campground');
const { join } = require('path');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

// settings
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//middleware
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const validateCampground = (req,res,next) =>{
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map((el) =>el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

app.engine('ejs', ejsMate);

app.get('/', (req,res) => {
    res.render('home');
});

app.get('/campgrounds', catchAsync(async(req,res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

app.get('/campgrounds/new', (req, res) =>{
    res.render('campgrounds/new');
});

app.post('/campgrounds', validateCampground, catchAsync(async(req,res) => {
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`campgrounds/${newCampground._id}`)
}));

app.get('/campgrounds/:id', catchAsync(async(req,res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
     res.render('campgrounds/show', { campground });
}));

app.get('/campgrounds/:id/edit', catchAsync(async(req,res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id); 
    res.render('campgrounds/edit', { campground });
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async(req,res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`)
}));

app.delete('/campgrounds/:id', catchAsync(async(req,res ) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

app.all('*', (req,res,next) => {
    next(new ExpressError('Page Not Found', 404));
});

//basic error handling middleware
app.use((err,req,res,next) =>{
    const { statusCode = 500} = err;
    if(!err.message) err.message = "Oh no, something went wrong!"
    res.status(statusCode).render('error', {err});
});

app.listen(3000, () =>{
    console.log("Listening on Port 3000");
});