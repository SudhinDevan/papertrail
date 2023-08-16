require('dotenv').config()
const express = require('express')
const app = express()
const user = require("./router/user")
const admin = require("./router/admin")
const session = require('express-session')
const mongoose = require("mongoose")
const cloudinary = require('cloudinary').v2;
const bodyParser = require('body-parser');

const fileUpload = require('express-fileupload')



mongoose.connect(process.env.db_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Database Connected")
}).catch((error) => {
    console.log(error.message)
})

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
})


app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload({
    useTempFiles: true,
    limits: { fileSize: 50 * 2024 * 1024 }
}));



app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: { sameSite: 'strict' },
    saveUninitialized: true,
    resave: false
}))

app.use((req, res, next) => {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate');
    res.header('Expires', '0');
    res.header('Pragma', 'no-cache');
    next();
});


app.use("/admin", admin)
app.use("/", user)

app.use((req, res,) => {
    res.status(404).render('User/404page');
});

const port = process.env.PORT;
app.listen(port, () => {
    console.log("server started at " + port);
})