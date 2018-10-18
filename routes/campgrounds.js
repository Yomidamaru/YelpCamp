const express 	 = require("express");
const router 	 = express.Router();
const Campground = require("../models/campground");
const middleware = require("../middleware");    //auto requires middleware/index.js
//INDEX show all campgrounds
router.get("/", function(req, res){
	Campground.find({}, function(err,allCampgrounds){
		if(err){
			console.log(err);
		}
		else {
			res.render("campgrounds/index", {campgrounds: allCampgrounds});
		}
	});
});
 //CREATE campground
router.post("/", middleware.isLoggedIn, function(req, res){
	const name = req.body.name;
	const image = req.body.image;
	const desc = req.body.description;
	const author = {
		id: req.user._id,
		username: req.user.username
	};
	const newCampground = {name: name, image:image , description: desc, author: author};
	// Create a new campground and save to DB
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		}
		else{
			res.redirect("/campgrounds");
		}
	});
});
// NEW - create campground form
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new.ejs");
});

//SHOW  more route
router.get("/:id", function(req, res){

	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err){
			console.log(err);
			console.log("There was an error for show");
		}
		else{
			console.log(foundCampground);
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
	 	res.render("campgrounds/edit", {campground: foundCampground});
	 });
});

//UPDATE CAMPGROUND ROUTE 
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			res.redirect("/campgrounds");
		}
		else{
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/campgrounds");
		}
		else{
			res.redirect("/campgrounds");
		}
	});
}); 

module.exports = router;