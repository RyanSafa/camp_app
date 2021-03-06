const Campground = require('../models/campground');

module.exports.index = async(req,res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) =>{
    res.render('campgrounds/new');
}

module.exports.createCampgrounds = async(req,res) => {
    const newCampground = new Campground(req.body.campground);
    newCampground.images = req.files.map(f => ({url: f.path, fileName: f.filename }));
    newCampground.author = req.user._id;
    await newCampground.save();
    console.log(newCampground);
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`campgrounds/${newCampground._id}`);
};

module.exports.showCampground = async(req,res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate:{
            path: "author"
        }
    }).populate('author');
    console.log(campground)
    if(!campground){
        req.flash('error', 'Cannot find that campground');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
};

module.exports.renderEditForm = async(req,res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id); 
    if(!campground){
        req.flash('error', 'Cannot find that campground')
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
};

module.exports.updateCampground = async(req,res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const imgs = req.files.map(f => ({url: f.path, fileName: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async(req,res ) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
}