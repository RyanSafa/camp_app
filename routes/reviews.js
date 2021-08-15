const express = require('express');
const router = express.Router({ mergeParams: true });
const {validateReviews, isLoggedIn, isReviewAuthor }=require('../middleware')
const Review = require('../models/review')
const reviews = require('../controllers/reviews')
const Campground = require('../models/campground');
const ExpressError = require('../utils/ExpressError')
const catchAsync = require('../utils/catchAsync.js')

router.post('/', isLoggedIn, validateReviews,catchAsync(reviews.createReview));
 
 router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));


 module.exports = router