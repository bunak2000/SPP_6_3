
//////const { log } = require('console');
const express = require('express');
const FileSystem = require('fs');
const path = require("path");
const multer = require('multer');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const e = require('express');
var cookieParser = require('cookie-parser');


const upload = multer({ dest: 'uploads/' });

const rootDirectoryPath = path.join(__dirname, '../drive');
const uploadFolderPath = path.join(__dirname, '../', '/uploads');
const SECRET_KEY = '1488';

const app = express();

app.set("view engine", "ejs");

app.listen(80);

app.use(cookieParser());

//app.use(express.json());
//app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
//console.log(path.join(__dirname, "../public"));
app.use(express.static(path.join(__dirname, "../public")));




const UserSchema = new mongoose.Schema(
    {
      login: String,
      password_hash: String,
      user_storage_path: String,
      last_user_path: String
    },
    { timestamps: true }
  );
  const User = mongoose.model("users", UserSchema);


mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/userDB', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', async function() {

    //let newUser = new User({login:'fk', password_hash:'dss', user_storage_path: null, last_user_path: null});
    
    //await newUser.save();

    console.log('-Connected-');
  });

let posts;
let fileList = [];
let directoryList = [];
let DirectoryFilesList = [];

let currentDirectory = rootDirectoryPath;

app.get("*", authMiddleware, function(req, res) {

    // console.log(req.params['0']);

    if(req.params['0'] == "/SelectFile"){
    // console.log(req._parsedOriginalUrl.query);
        if(req._parsedOriginalUrl.query == "" || req._parsedOriginalUrl.query == "..."){
            if(req._parsedOriginalUrl.query == ""){
                currentDirectory = rootDirectoryPath;
            }else{
                currentDirectory = path.join(currentDirectory,"../");
                currentDirectory = currentDirectory.substr(0, currentDirectory.length - 1);
            }   
            getDirectoryFilesList(currentDirectory);   
            res.send({ fileList, directoryList});
        }else{
            let fullPath = path.join(currentDirectory, "/", req._parsedOriginalUrl.query);
            if (FileSystem.existsSync(fullPath)) {

                if(FileSystem.lstatSync(fullPath).isFile()){
                    // console.log(fullPath);
                    res.download(fullPath);
                }
                else{
                    currentDirectory = fullPath;
                    getDirectoryFilesList(currentDirectory);   
                    res.send({ fileList, directoryList});
                }

            }

        } 
        return;
    }
    
    res.status(200);
    res.send();

});

app.post("/Authentication", upload.single("file"), function(req, res){

    let unAuthUser = {login: req.body.email, password_hash: req.body.password};

    authenticationUser(unAuthUser, res);

});

app.post("/Registration", upload.single("file"), function(req, res){

    //console.log('32');

    // console.log(req.body);

    let newUser = new User({login: req.body.email, password_hash: req.body.password, user_storage_path: null, last_user_path: null});
    registrateNewUser(newUser);

    res.status(201);   
    res.send();

});

app.post("*", authMiddleware, upload.single("file"), function(req, res) { //need
    const { file } = req;


    if (req.url == "/UploadFile") {
        replaceFile(file.originalname, file.filename, currentDirectory);
    } else {
        if (req.url == "/AddFile") {
        // console.log(req.body);
        if (FileSystem.existsSync(path.join(currentDirectory, "/", req.body.name)) == false) {
        FileSystem.mkdirSync(path.join(currentDirectory, "/", req.body.name));
        }
        }
    }
        
    getDirectoryFilesList(currentDirectory);   
    res.send({ fileList, directoryList});
});

function authMiddleware(req, res, next){
  
    let token = req.cookies?.token;

    // console.log(token);
    //console.log(token);

    try{
        if(!token){
            throw({message: 'invalid token'});
        }
        const decoded = jwt.verify(token, SECRET_KEY);    
    }
    catch(e){
        if (e.message === "invalid token") {
            res.cookie("token", null, { httpOnly: true });
            res.status(401);
            res.send();
            return;
        }
        else {
            //throw e;
            res.status(401);
            res.send();
            return;
        }
    }

    next();
}

async function authenticationUser(unAuthUser, res){

    let user = await User.findOne({login: unAuthUser.login});

    //console.log(user);

    if(user){
        const { password_hash } = user;

        status = await bcrypt.compare(unAuthUser.password_hash, password_hash);
        if(!status){
            res.status(401);
            res.send();  
        }

        const token = jwt.sign({user}, SECRET_KEY, {expiresIn: "2 days"});///process.env.SECRET_KEY

        res.status(200);
        res.cookie("token", token, {httpOnly: true});
        res.send(token);
        return;

    } else { 
        res.status(401);
        res.send();
        return;
    }

}

async function registrateNewUser(newUser){

    // console.log(newUser.password_hash);

    let salt = await bcrypt.genSalt(15);
    let hash = bcrypt.hashSync(newUser.password_hash, salt);

    // console.log(hash);

    newUser.user_storage_path = path.join(__dirname, '../drive/', newUser.login);
    newUser.last_user_path = newUser.user_storage_path;

    FileSystem.mkdirSync(newUser.user_storage_path);

    newUser.password_hash = hash;
    await newUser.save();
    //console.log(user);
}

function CalculateResault() {
    posts = "sdsds";
}

function replaceFile(originfilename, fileName, destination) {
    FileSystem.renameSync(path.join(uploadFolderPath, "/", fileName),
        path.join(destination, "/", originfilename));
}

function createDirectory(currentDirectory, folderName) {

}

function getDirectoryFilesList(currentDirectory) {
    directoryList = [];
    fileList = [];

    DirectoryFilesList = FileSystem.readdirSync(currentDirectory);

    let currentFilePath;
    let length = rootDirectoryPath.length;

    if (currentDirectory != rootDirectoryPath){
        directoryList.push({name: "...", path: ""});
        // console.log(currentDirectory);
    }

    DirectoryFilesList.forEach(function(fileName) {
        currentFilePath = path.join(currentDirectory, "/", fileName);
        if (FileSystem.lstatSync(currentFilePath).isDirectory() == true) {

            directoryList.push({ name: fileName, path: currentFilePath.substr(length) });

        } else {
            fileList.push({ name: fileName, path: currentFilePath.substr(length) });
        }
    });
}