const express       = require("express"),
	  app 		    = express(),
	  bodyParser    = require("body-parser"),
	  mongoose      = require("mongoose"),
	  passport	    = require("passport"),
	  LocalStrategy = require("passport-local"),
	  methodOveride = require("method-override"),
  	  Campground    = require("./models/campground"),
  	  Comment 	    = require("./models/comment"),
  	  User 			= require("./models/user");
	  // seedDB        = require("./seeds");

//requiring routes
const commentRoutes    = require("./routes/comments"),
	  campgroundRoutes = require("./routes/campgrounds"),
	  indexRoutes 	   = require("./routes/index");

mongoose.connect("mongodb://localhost:27017/yelp_camp", { useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOveride("_method"));
// seedDB();  //seed the database

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

//passing req.user to every route. Since header.ejs is everywhere
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();	// will move out of middleware to route handler
});

app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes); 
app.use("/campgrounds/:id/comments", commentRoutes);


app.listen(3000, function(){
	console.log("----The YelpCamp Server Has Started!---")
});
