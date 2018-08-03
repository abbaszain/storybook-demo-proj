const express = require('express');
const exphbs  = require('express-handlebars');
const path = require('path');
const expressSession = require('express-session');
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const cookieParse = require('cookie-parser');
const bodyParse = require('body-parser');
const passport = require('passport');
const keys = require('./config/keys');

// Handlebars helpers

const {truncate,stripTags, formatDate, select, editIcon} = require('./helpers/hbs');
// Connect database
mongoose.connect(keys.mongoURI)
.then(() => console.log('Database connnected'))
.catch((err)=> console.log(err));
// Load models
require('./models/User');
require('./models/Story');
// Load routes 
    // Passport config
require('./config/passport')(passport);
const auth = require('./routes/auth');
const user = require('./routes/user');
const stories = require('./routes/stories');

const app = express();

app.engine('handlebars', exphbs({
    helpers: {
        truncate: truncate,
        stripTags: stripTags,
        formatDate: formatDate,
        select: select,
        editIcon: editIcon
    },
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use(bodyParse.urlencoded({ extended: false }))
app.use(bodyParse.json());


app.use(cookieParse());
app.use(expressSession({
    secret: 'myworld',
    resave: false,
    saveUninitialized: false
}));
// Passport middlewares

app.use(passport.initialize());
app.use(passport.session());
// Method override middleware
app.use(methodOverride('_method'));
// Set global vars????
app.use((req,res,next)=> {
    res.locals.user = req.user || null;
    next();
})

// Set static folder
app.use(express.static(path.join(__dirname, "public")));
// Use Routes
app.use('/', user);
app.use('/auth', auth);
app.use('/stories', stories);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`App started on port ${port}`);
})