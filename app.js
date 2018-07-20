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

    res.redirect('/blogs')
})

app.get('/blogs',(req,res)=>{
    Blog.find({},(err,blogs)=>{
        if(err){
            console.log(err)
        }
        else{
            res.render('index.ejs',{blogs:blogs})
        }
    })


})
app.get('/blogs/new',(req,res)=>{

res.render('new.ejs')
})

// --------------------Creating Blogs-----------------------

app.post('/blogs',(req,res)=>{

    Blog.create(req.body.blog,  (err,newBlog)=> {
        if(err){
            res.render('new.ejs')
        }
        else{
            res.redirect('/blogs')
        }
    })
})

// ------------------SHOW-------------

app.get('/blogs/:id',(req,res)=>{

    Blog.findById(req.params.id,(err,foundBlog)=>{
        if(err){
            console.log(err);
            res.redirect('/blogs')
        }else{

            res.render('show.ejs',{blog:foundBlog})
        }

    })
    //res.send("Hey there")
})

//-----------------EDIT--------------------

app.get('/blogs/:id/edit',(req,res)=>{
   // res.render('edit.ejs')
    Blog.findById(req.params.id,(err,foundBlog)=>{
        if(err){
            console.log(err);
            res.redirect('/blogs')
        }else{

            res.render('edit.ejs',{blog:foundBlog})
        }

    })
app.put('/blogs/:id',(req,res)=>{
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,(err,updatedBlog)=>{
        if(err){
            res.redirect('/blogs');
        }
        else{
            res.redirect('/blogs/'+req.params.id);
        }

    })

})
});

app.delete('/blogs/:id',(req,res)=>{

    //res.send('yooooooo')

    Blog.findByIdAndRemove(req.params.id,(err,)=>{

        if(err){
            console.log(err)
            res.redirect('/blogs')
        }
        else {
            res.redirect('/blogs')
        }
    })
})

app.listen(3232, ()=>{
    console.log('Server started at http://localhost:3232');
})