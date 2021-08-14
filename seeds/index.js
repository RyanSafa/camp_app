const mongoose = require('mongoose');
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')
const Campground = require('../models/campground')

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


const sample = (arr) =>arr[Math.floor(Math.random()*arr.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++){
        const randomNumber = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            author: '6117234eaef6903501e4b454',
            location: `${cities[randomNumber].city}, ${cities[randomNumber].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur placeat similique libero, consectetur alias at doloremque facilis possimus excepturi quos, architecto incidunt eaque labore neque, ullam quam minima recusandae sunt.',
            price
        });
        await camp.save();
    }
};

seedDB().then(() =>{
    mongoose.connection.close();
});