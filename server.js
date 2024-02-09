const express = require('express');
const mongoose = require('mongoose');
var cors = require('cors')
const multer = require('multer');
const bodyParser = require('body-parser');
const User = require('./models/user');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const Question = require('./models/question');
const Experience = require('./models/experience');
const Answer = require('./models/answer');
const Likes = require('./models/likes');
const Dislikes = require('./models/dislikes');
const path = require("path");

require("dotenv").config();

mongoose.Promise = global.Promise;
mongoose.connect('mongodb+srv://tanwarpurnima05:purvi123@cluster0.l6unbqx.mongodb.net/', 
{
  useNewUrlParser: true, 
  useUnifiedTopology: true,
}, 
function(err) {
  if (err) {
    console.log(err);
  }else{
    console.log("MongoDB Database Connected Successfully!"); 
  }
});

const app = express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
const PORT = process.env.PORT || 5000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,'./uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname)
  },  
});

const limits = {
    fileSize : 40000000
}

//fileFilter function controls which files should be uploaded. req = request being made. file = contains file info. cb = callback function to tell multer when we are done filtering the file. send back an error message to the client with cb.
const fileFilter =(req, file, cb) => {
  //if the file is not a jpg, jpeg, or png file, do not upload it multer; reject it.
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('File must be of type JPG, JPEG, or PNG and nore more than 2MB in size'))
  }
  //undefined = nothing went wrong; true = that is true, nothing went wrong, accept the upload.
  cb(undefined, true)
}

//set up the multer middleware
const upload = multer({
    storage: storage,
    limits: limits,
    fileFilter: fileFilter
    // filename: filename
})

app.post('/login', async(req, res) => {
  // Our login logic starts here
  //console.log(req);
  try {
    // Get user input
    const { email, password } = req.body;
    // Validate user input
    if (email === '' && password === '') {
      res.status(400).json({message: "All input is required"});
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email });

    if(user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "24h",
        }
      );

      // save user token
      user.token = token;

      // user
      res.status(200).json(user);
    }else{
      res.status(400).json({message: "Invalid Credentials"});
    }
    
  } catch (err) {
    console.log(err);
  }
  // Our Login logic ends here
});

app.post('/register', async(req, res) => {
  // Our register logic starts here
  try {
    // Get user input
    const { name, email, password, ucategory } = req.body;
    // Validate user input
    if (!(email && password && name && ucategory)) {
      res.status(400).json({message: "All input is required"});
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).json({message: "User Already Exist. Please Login"});
    }

    //Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
      ucategory : ucategory,
      createdAt: new Date()
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});

app.post('/editprofile', upload.single('photo'), async(req, res) =>{

  const name = req.body.name;
  const about = req.body.about;
  const ucategory = req.body.ucategory;
  
  const location = req.body.location;
  const title = req.body.title;
  let photo = '';
  if(req.file !== undefined){
    photo = req.file.filename;
  }else{
    photo = req.body.photo;
  }
  const wlink = req.body.wlink;
  const tusername = req.body.tusername;
  const gusername = req.body.gusername;

  const userID = req.query.userID;

  try{
    const userData = await User.findByIdAndUpdate(userID,
    {
      $set : {
        name: name,
        ucategory:ucategory,
        about: about,
        photo: photo,
        title: title,
        location: location,
        wlink: wlink,
        tusername: tusername,
        gusername: gusername
      }
    }, {"new": true})

    res.status(200).json(userData);

  }catch(err) {
    console.log(err);
  }

})

app.post('/addquestion',  async(req, res) =>{

  const query = req.body.query;
  const categoryID = req.body.categoryID;
  const categoryName = req.body.categoryName;
  const author = req.body.author;
  const authorID = req.body.authorID;
  const tags = req.body.tags;

  if(query && categoryID && categoryName && author && authorID && tags){
  try{
    const questionData = await Question.create({
      query: query,
      categoryID: categoryID, 
      categoryName: categoryName,
      author: author,
      authorID: authorID,
      views: 0,
      tags: tags
    });
    res.status(200).json(questionData);
  } catch (err) {
    console.log(err);
  }
  }else{
    res.status(400).json('Something Went Wrong!');
  }

})

app.post('/addview',  async(req, res) =>{
  const id = req.query.id;
  const view = req.body.view;
  if(id && view){
    try {
    const prevViews = await Question.find({"_id": id}).then(function(doc) {
      return doc[0].views;
    });
    const viewData = await Question.findOneAndUpdate(
      {_id: id},
      {
        $set: { views: Number(prevViews+view)}
      }, {new: true}
    );
    res.status(200).json(viewData);
    } catch (err) {
      console.log(err);
    }
  }else{
    res.status(400).json('Something Went Wrong!');
  }
})

app.post('/addanswer',  async(req, res) =>{

  const questionID = req.query.id;
  const answer = req.body.answer;
  const user = req.body.user;
  const userID = req.body.userID;
  const query = req.body.query;

  if(answer && questionID && user && userID && query){
    try {
    const ansData = await Answer.create({
      questionID: questionID,
      answer : answer,
      user: user,
      userID: userID,
      query: query
    });
    res.status(200).json(ansData);
    } catch (err) {
      console.log(err);
    }
  }else{
    res.status(400).json('Something Went Wrong!');
  }
})

app.get("/getuser", async(req, res)=>{   
  const userID = req.query.userID;
  try{
    const userData = await User.find({"_id": userID})
    res.status(200).json(userData);
  }catch(err) {
    console.log(err);
  }
});

app.get("/getanswers", async(req, res)=>{   
  const questionID = req.query.id;
  try{
  const allAnswers = await Answer.find({"questionID": questionID})
  res.status(200).json(allAnswers);
  }catch(err) {
    console.log(err);
  }
});

app.post("/getlikes", async(req, res)=>{  
  const answerID = req.body.props.answerID;
  try{
  const allLikes = await Likes.find({"answerID": answerID})
  res.status(200).json(allLikes);
  }catch(err) {
    console.log(err);
  }
});

app.post("/getdislikes", async(req, res)=>{   
  const answerID = req.body.props.answerID;
  try{
  const allDisLikes = await Dislikes.find({"answerID": answerID})
  res.status(200).json(allDisLikes);
  }catch(err) {
    console.log(err);
  }
});

app.post("/uplike", (req, res)=>{   
  let variable = {};
  variable = req.body.variable;
  if(variable){
  const like = new Likes(variable);
  like.save((err, likeResult) => {
    if(err) return res.json({success: false, err})
    Dislikes.findOneAndDelete(variable)
    .exec((err, dislikeResult) => {
      if(err) return res.status(400).json({success: false, err})
      res.status(200).json({success: true, likeResult})
    })
  });
  }else{
    res.json({message: 'Data is Empty'})
  }
});

app.post("/unlike", (req, res)=>{   
  let variable = {};
  variable = req.body.variable;
  Likes.findOneAndDelete(variable)
    .exec((err, result) => {
      if(err) return res.status(400).json({success: false, err})
      res.status(200).json({success: true, result})

    })
});

app.post("/undislike", (req, res)=>{  
  let variable = {};
  variable = req.body.variable;
  Dislikes.findOneAndDelete(variable)
    .exec((err, result) => {
      if(err) return res.status(400).json({success: false, err})
      res.status(200).json({success: true, result})

    })
});

app.post("/updislike", (req, res)=>{   
  let variable = {};
  variable = req.body.variable;
  const dislike = new Dislikes(variable);
  dislike.save((err, dislikeResult) => {
    if(err) return res.json({success: false, err})
    Likes.findOneAndDelete(variable)
    .exec((err, likeResult) => {
      if(err) return res.status(400).json({success: false, err})
      res.status(200).json({success: true, dislikeResult})
    })
  });
});

app.get("/getquestions", async(req, res)=>{   
  const authorID = req.query.authorID;
  try{
    /**.sort({ _id: -1 }) : sorts in descending order mean , most recent occurs first */
  const allQues = await Question.find({"authorID": authorID}).sort({ _id: -1 })
  res.status(200).json(allQues);
  }catch(err) {
    console.log(err);
  }
});

app.get("/getallquestions", async(req, res)=>{   
  try{
  const limit = parseInt(req.query.limit);
  const skip = parseInt(req.query.skip);
  /*Uses Mongoose to query the "Question" collection. It retrieves all documents (questions) and applies skip, limit, and sorting. The result is stored in the variable allQues */
  const allQues = await Question.find({}).skip(skip).limit(limit).sort({ _id: -1 })
  //console.log(allQues)
  res.status(200).json(allQues);
  }catch(err) {
    console.log(err);
  }
});

/*get category questions */
app.get("/getcquestions", async(req, res)=>{   
  const categoryID = req.query.categoryID;
  const limit = parseInt(req.query.limit);
  const skip = parseInt(req.query.skip);
  //console.log(limit)
  try{
    const cQues = await Question.aggregate([
      {
        "$match": {
          "categoryID": categoryID
        }
      },
      {
        "$sort": {
          updatedAt: -1
        }
      },
      {
        "$skip": skip
      },
      {
        "$limit": limit
      }
    ])
    res.status(200).json(cQues);
  }catch(err) {
    console.log(err);
  }
});

app.get("/gettaggedquestions", async(req, res)=>{   
  const tag = req.query.tag;
  const limit = parseInt(req.query.limit);
  const skip = parseInt(req.query.skip);
  try{
    const taggedQues = await Question.find({ tags: { $all: tag } }).skip(skip).limit(limit).sort({ _id: -1 })
    res.status(200).json(taggedQues);
  }catch(err) {
    console.log(err);
  }
});

app.get("/getaquestions", async(req, res)=>{   
  const authorID = req.query.authorID;
  const limit = parseInt(req.query.limit);
  const skip = parseInt(req.query.skip);
  try{
    const aQues = await Question.aggregate([
      {
        "$match": {
          "authorID": authorID
        }
      },
      {
        "$sort": {
          updatedAt: -1
        }
      },
      {
        "$skip": skip
      },
      {
        "$limit": limit
      }
    ])
    res.status(200).json(aQues);
  }catch(err) {
    console.log(err);
  }
});

app.get("/getaanswers", async(req, res)=>{   
  const userID = req.query.userID;
  try{
    const aAns = await Answer.find({"userID": userID}).sort({ _id: -1 })
    res.status(200).json(aAns);
  }catch(err) {
    console.log(err);
  }
});

app.post("/updatequestion", async(req, res) =>{  
  //console.log(req.body) 
  const questionID = req.query.questionID;
  try{
    const allQues = await Question.findByIdAndUpdate(questionID,
    {
      $set : {
        query: req.body.query,
        categoryID: req.body.categoryID,
        categoryName: req.body.categoryName,
        tags: req.body.tags
      }
    }, {"new": true})
    res.status(200).json(allQues);
  }catch(err) {
    console.log(err);
  }
});

app.delete("/deletequestion", async(req, res) => {
  const questionID = req.query.questionID;
  try{
    const allQues = await Question.findByIdAndDelete(questionID)
    res.status(200).json(allQues);
  }catch(err) {
    console.log(err);
  }
});

app.post('/addexperience',  async(req, res) =>{

  const query = req.body.query;
  const author = req.body.author;
  const authorID = req.body.authorID;
  const authorcontact = req.body.authorcontact;
  const authoremail = req.body.authoremail;
  const authorlinkedin = req.body.authorlinkedin;
  const company = req.body.company;
  const year = req.body.year;
  const expname = req.body.expname;
 

  if(query  && author && authorID && authorcontact && authoremail && authorlinkedin){
  try{
    const questionData = await Experience.create({
      query: query,
      author: author,
      authorID: authorID,
      authoremail: authoremail,
      authorcontact: authorcontact,
      authorlinkedin: authorlinkedin,
      company: company,
      year: year,
      expname : expname,
      views: 0,
      
    });
    res.status(200).json(questionData);
  } catch (err) {
    console.log(err);
  }
  }else{
    res.status(400).json('Something Went Wrong!');
  }

})

app.get("/getallexperiences", async(req, res)=>{   
  try{
  const limit = parseInt(req.query.limit);
  const skip = parseInt(req.query.skip);
  const allExp = await Experience.find({}).skip(skip).limit(limit).sort({ _id: -1 })
  //console.log(allQues)
  res.status(200).json(allExp); 
  }catch(err) {
    console.log(err);
  }
});


app.listen(PORT, () => {
  console.log(`API running at Port ${PORT}`)
});