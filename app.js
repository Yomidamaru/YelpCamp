var express = require("express"),
app 		= express(),
bodyParser  = require("body-parser"),
mongoose 	= require("mongoose");

mongoose.connect("mongodb://localhost/yelp_camp");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var campgroundSchema = new mongoose.Schema({
	name: String,
	image: String
});

var Campground = mongoose.model("Campground", campgroundSchema);

// Campground.create(
// 	{
// 		name: "Granite Hill",
// 		image: "https://farm1.staticflickr.com/60/215827008_6489cd30c3.jpg"
// 	},
// 	function(err, campground){
// 		if(err){
// 			console.log(err);
// 		}
// 		else{ 
// 			console.log("NEWLY CREATED CAMPGROUND!");
// 			console.log(campground);
// 		}	
// 	});

app.get("/", function(req, res){
	res.render("landing")
});


app.get("/campgrounds", function(req, res){
	Campground.find({}, function(err,allCampgrounds){
		if(err){
			console.log(err);
		}
		else {
			res.render("campgrounds", {campgrounds: allCampgrounds});
		}
	});
});
 
app.post("/campgrounds", function(req, res){
	var name = req.body.name;
	var image = req.body.image;
	var newCampground = {name: name, image:image};
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		}
		else{
			res.redirect("/campgrounds");
		}
	});
});

app.get("/campgrounds/new", function(req, res){
	res.render("new.ejs");
});

app.listen(3000, function(){
	console.log("----The YelpCamp Server Has Started!---")
});