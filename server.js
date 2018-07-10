const express=require('express')
const path = require('path')
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const app=express();
const methodOverride=require('method-override')
mongoose.connect('mongodb://localhost/blogapp');

app.set('view-engine','ejs');
app.use('/', express.static(path.join(__dirname, 'public')))

//app.use(express.static('public'));
app.use(methodOverride("_method"))
app.use(bodyParser.urlencoded({extended:true}));

let blogSchema= new mongoose.Schema({

    title:String,
    image:String,
    body:String,
    created:{ type:Date,
        default:Date.now}
});

var Blog=mongoose.model('Blog', blogSchema);


// Blog.create({
//     title:"Hello Shooting Star",
//     image:'https://cdn.pixabay.com/photo/2015/03/26/09/59/purple-690724_960_720.jpg',
//     body:'This is a blog'
// })


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