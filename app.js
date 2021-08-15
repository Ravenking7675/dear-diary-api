const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const Diary= require('./model/post');

const userRoute = require('./routes/user')

const checkAuth = require('./middleware/check-auth')

//Addding multer configs

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb ) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid MIME type')
    if(isValid) {
      error = null;
    }

    cb(error, "backend/images");
  },
  filename: (req, file, cb ) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name+ '-' + Date.now() + '.' + ext);
  }
});

require('dotenv/config');

const app = express();



//Connecting mongoose and mongoDB
mongoose.connect('mongodb+srv://test_boy:ravenking7675@meanstack.0zicv.mongodb.net/deardiary?retryWrites=true&w=majority',
{
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
  .then(() => {
  console.log("Connected to database");
  })
  .catch(err => {
    console.log(err);
  })


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Allow image to be fetched from client
app.use("/images", express.static(path.join("backend/images")))

app.all("/*", function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST,PUT, PATCH, DELETE, OPTIONS"
  );

  next();
});

app.use('/user', userRoute);

//Get diary
app.get('/', (req, res) => {

  console.log("Client requested for getDiary()");

  console.log(req.query);

  const pageSize = Number(req.query.pageSize);
  const currentPage = Number(req.query.currentPage);

  const diaryQuery = Diary.find()


  if(pageSize && currentPage) {
    diaryQuery.skip(pageSize * (currentPage - 1));
    diaryQuery.limit(pageSize)
    console.log(pageSize, currentPage);
  }

  diaryQuery.then(document => {
    res.status(200).json(document);
  });

})

//Add diary
app.post('/diary',checkAuth ,multer({storage: storage}).single("image") ,(req, res, next) => {

  console.log(req.body);

  //Adding mongoose

  const url = req.protocol + "://" + req.get('host')

  const diary = new Diary({
    title : req.body.title,
    description: req.body.description,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.tokenData.userId
  });



  diary.save().then(createdDiary => {

      res.status(201).json({
        message: "Diary added successfully",
        diary: {
          _id: createdDiary._id,
          title: createdDiary.title,
          description: createdDiary.description,
          imagePath: createdDiary.imagePath
        }
      })

  });


  });


//Delete diary

app.get('/diary/:id', checkAuth, (req, res) => {
  console.log(req.params.id);

  Diary.deleteOne({ _id: req.params.id, creator: req.tokenData.userId}).then(document => {
    console.log("Deleted : "+document);

    if(document.n > 0){

          res.status(200).json({
            message : "This diary was deleted successfully!"
          });
    }
    else{
          res.status(400).json({
            message : "deletion failed!"
          });
        }
  })
})

//Update Diary

app.post('/diary/:id',checkAuth,multer({storage: storage}).single("image"), (req, res) => {
  console.log("Called for update! ",req.body.title);
  //61129cf7c62a106bac24d78b

  const url = req.protocol + "://" + req.get('host')

  diary = {
    title: req.body.title,
    description: req.body.description,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.tokenData.userId

  }

  Diary.findOneAndUpdate({ _id: req.body.id, creator: req.tokenData.userId}, diary ,null ,(err, data)=> {

    if(err){
      console.log(err);
    }
    else {
      console.log("I am inside the update loop!")


        console.log("Updated...", data)
        res.json({
          message: "This diary was updates successfully!",
          diary : diary
        })


    }

  })
})


module.exports = app;
