const express       = require("express"),
	  app 		    = express(),
	  bodyParser    = require("body-parser"),
	  mongoose      = require("mongoose"),
	  passport	    = require("passport"),
	  LocalStrategy = require("passport-local"),
  	  Campground    = require("./models/campground"),
  	  Comment 	    = require("./models/comment"),
  	  User 			= require("./models/user"),
	  seedDB        = require("./seeds");

mongoose.connect("mongodb://localhost:27017/yelp_camp", { useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
seedDB();

// PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "The best is blessed",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//passing user to everything
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();	// will move out of middleware to route handler
});

app.get("/", function(req, res){
	res.render("landing")
});

//INDEX show all campgrounds
app.get("/campgrounds", function(req, res){
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
app.post("/campgrounds", function(req, res){
	const name = req.body.name;
	const image = req.body.image;
	const newCampground = {name: name, image:image , description: desc};
	const desc = req.body.description;
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
	res.render("campgrounds/new.ejs");
});

//SHOW  more route
app.get("/campgrounds/:id", function(req, res){

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

// ====================
// COMMENTS ROUTES 
// ====================

app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res){
	//find campground by id
	Campground.findById(req.params.id, function(err, campground){
	if(err){
		console.log(err);
		}
	else{
		res.render("comments/new", {campground: campground});
		}
	});	
});

app.post("/campgrounds/:id/comments", isLoggedIn, function(req, res){ 
//look up campground using ID
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		}
		else{
			//Create new comment
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					console.log(err);
				}
				else{
				//connect new comment to campground
				campground.comments.push(comment);	
				campground.save();
				//redirect campground show page
				res.redirect('/campgrounds/' + campground._id);
				}
			});
		}
	});
});

//==================
// AUTH ROUTES
//==================

//show register form
app.get("/register", function(req, res){
	res.render("register");
});

//Handle sign up logic
app.post("/register", function(req, res){
	const newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if (err) {
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("/campgrounds");
		});
	});
});

// show login form
app.get("/login", function(req, res){
	res.render("login");
})

//Handling login logic
app.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}), function(req, res){
	//no callback
});

//logout route
app.get("/logout", function(req,res){
	req.logout();
	res.redirect("/campgrounds");
});

//logged in middleware
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login")
}

app.listen(3000, function(){
	console.log("----The YelpCamp Server Has Started!---")
});
