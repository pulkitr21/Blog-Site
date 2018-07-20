const express=require('express')
const path = require('path')
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const app=express();

const    passport = require("passport")
const    flash = require ("connect-flash")
const    fileUpload = require('express-fileupload')
const    LocalStrategy = require("passport-local")
const    mailer = require('express-mailer')
const    passportLocalMongoose = require("passport-local-mongoose")
const    User = require("./models/user") ;


const methodOverride=require('method-override');
var alrt = 0 ;

mongoose.connect('mongodb://localhost/blogapp');

app.set('view-engine','ejs');
app.use(flash()) ;

app.use(fileUpload());

app.use('/', express.static(path.join(__dirname, 'public')))
mailer.extend(app, {
    from: 'no-reply@example.com',
    host: 'smtp.gmail.com', // hostname
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
    auth: {
        user: 'ha_zellat@esi.dz',
        pass: '20171782'
    }
});

//app.use(express.static('public'));
app.use(methodOverride("_method"))
app.use(bodyParser.urlencoded({extended:true}));

let CommentScheema = new mongoose.Schema({
    name : String ,
    content : String
}) ;
let Comment = mongoose.model("Comment" , CommentScheema ) ;



let blogSchema= new mongoose.Schema({

    title:String,
    author : String ,
    authorID : String ,
    image:String,
    body:String,
    comments : [CommentScheema] ,
    created:{ type:Date,
        default:Date.now}
});

var Blog=mongoose.model('Blog', blogSchema);

app.use(require("express-session")({
    secret : "Sceintific Club Of ESI" ,
    resave : false ,
    saveUninitialized : false
})) ;
// Blog.create({
//     title:"Hello Shooting Star",
//     image:'https://cdn.pixabay.com/photo/2015/03/26/09/59/purple-690724_960_720.jpg',
//     body:'This is a blog'
// })

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function (req,res,next) {
    res.locals.currentUser = req.user ;
    res.locals.success = req.flash("success") ;
    res.locals.error = req.flash("error") ;
    next() ;
})

// --------------------ROUTING------------------------

app.get('/',(req,res)=>{

    res.render("home") ;
})





app.get('/blogs',(req,res)=>{
    Blog.find({} , function(err ,Blogs) {
        if(err) {
            req.flash("error" , err) ;
        }
        else {
            res.render("index" , { Blogs : Blogs }) ;
        }
    })


});

app.post("/new" , function (req,res) {
    Blog.create( req.body.blog , function (err , createdBlog) {
        if(err) { req.flash("error" , err)} else {
            createdBlog.author = req.user.username ;
            createdBlog.authorID = req.user._id ;
            createdBlog.save() ; }
    }) ;
    req.flash("success" , "A new blog has been added") ;
    res.redirect("/blogs") ;
});


app.get('/blogs/new',IsLoggedIn,(req,res)=>{

res.render('new.ejs')
})

app.get("/blogs/register" , function (req,res) {
    res.render("register") ;
})

app.post("/register" , function (req,res) {
    /*req.body.username
    req.body.password*/
    User.register(new User ({username : req.body.username }) ,  req.body.password , function (err , user ) {
        if (err) {
            console.log(err) ;
            req.flash("error" , err.message)
            return res.render("register") ;
        }
        passport.authenticate("local")(req,res,function () {
            req.flash("success" , " Welcome To BlogApp  " +  user.username) ;
            app.mailer.send('mail', {
                to: req.body.mail , // REQUIRED. This can be a comma delimited string just like a normal email to field.
                subject: 'Welcome To BlogApp', // REQUIRED.
                otherProperty: 'Other Property' // All additional properties are also passed to the template as local variables.
            }, function (err) {
                if (err) {
                    // handle error
                    console.log(err);
                    //res.send('There was an error sending the email');
                    return;
                }
                // res.send('Email Sent');
            });
            res.redirect("/blogs") ;
        });
    });





});

app.get("/blogs/login" , function (req,res) {
    res.render("login") ;
})

app.post("/login" ,passport.authenticate("local" , {
    failureRedirect : "/blogs/login" ,
    failureFlash : " Invalid username or password " ,
    successRedirect : "/blogs" ,
    successFlash : "Welcome !  "  ,

}), function (req,res) {
});

app.get("/blogs/logout" , function (req,res) {

    req.flash("success" , " GoodBye  !  " + req.user.username) ;
    req.logout() ;
    res.redirect("/blogs") ;
});



app.get("/blogs/:id"  ,function (req,res) {
    Blog.findById( req.params.id , function (err , foundBlog) {
        if(err) {
            req.flash("error" , err.message) ;
            res.redirect("/blogs")} else {
            res.render("show" , {blog : foundBlog , req : req })

        }
    })
})

app.get("/blogs/:id/edit" , function (req,res) {
    Blog.findById(req.params.id , function (err , foundBlog) {
        if ( err) {
            req.flash("error" , err.message) ;
            res.redirect("/blogs") } else {
            res.render("edit" , {Blog : foundBlog })
        }
    })

})


app.put("/blogs/:id" ,  function(req,res) {

    if ( req.isAuthenticated()) {
        Blog.findById(req.params.id  , function(err, foundBlog) {
            if (req.user._id == foundBlog.authorID ) {
                Blog.findByIdAndUpdate( req.params.id , req.body.blog , function (err , updatedBlog ) {
                    if (err) {
                        req.flash("error" , err.message) ;
                        res.redirect("/blogs")} else {
                        req.flash("success" , "The blog has been edited") ;
                        res.redirect("/blogs/"+req.params.id) ;


                    }
                })
            } else {

                res.send("YO DON'T HAVE PERMISSION TO DO THAT !!") ;
            }
        })

    } else {
        res.send("YOU NEED TO BE LOGGED IN TO DO THAT !! ") ;
    }

})


app.delete("/blogs/:id" ,  function(req,res) {

    if ( req.isAuthenticated()) {
        Blog.findById(req.params.id  , function(err, foundBlog) {
            if (req.user._id == foundBlog.authorID ) {
                Blog.findByIdAndRemove(req.params.id , function() {
                    req.flash("success" , "The blog has been deleted") ;
                    res.redirect("/blogs");
                })
            } else {

                req.flash("error"," You don't have permission to do that ") ;
                res.redirect("/blogs") ;
            }
        })

    } else {
        req.flash("error","You need to be logged in to do that") ;
        res.redirect("/blogs") ;
    }

})

app.post("/blogs/:id/comment" ,IsLoggedIn ,  function (req,res) {
    Blog.findById( req.params.id , function (err , foundBlog) {
        if(err) { req.flash("error" , err.message)} else {

            foundBlog.comments.push({ name : req.user.username  , content : req.body.comment})  ;
            foundBlog.save();
            req.flash("success" , "Successfully added comment")

        }
    })

    res.redirect("/blogs/"+req.params.id) ;
})

function IsLoggedIn (req , res , next) {
    if(req.isAuthenticated()) {
        return next() ;
    }
    req.flash("error" , "You need to be logged in to do that") ;
    res.redirect("/blogs/login") ;
}

//app.listen(port , () => console.log("SERVER HAS STARTED , CHECK  " + port)) ;

app.listen(3232, ()=>{
    console.log('Server started at http://localhost:3232');
})