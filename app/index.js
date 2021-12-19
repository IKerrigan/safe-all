require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const busboyBodyParser = require('busboy-body-parser');
const session = require('express-session');
const crypto = require('crypto');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');
var cloudinary = require('cloudinary');

let market = require('./routes/market');
let api = require('./routes/api');
require('./modules/bot');

var array = require('lodash/array');

cloudinary.config({
  cloud_name: 'ddldajrwt',
  api_key: '816636726988823',
  api_secret: 'K2YwVGMV3NgjvfaU7ZW4d3c5j-k',
});

const storage = require('./modules/storage');
const config = require('./modules/config');

const app = express();

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/market', function (req, res) {
  res.sendFile('ajax.html');
});

app.use(bodyParser.json());
app.use(busboyBodyParser());

app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  storage.User.findOne({ _id: id }).then((user) => {
    if (!user) done('No user');
    else done(null, user);
  });
});

passport.use(
  new LocalStrategy(function (username, password, done) {
    let passwordHash = sha512(password, serverSalt).passwordHash;
    storage.User.findOne({ username: username, password: passwordHash }).then(
      (user) => {
        if (!user) return done('No user', false);
        return done(null, user);
      }
    );
  })
);

const serverSalt = 'as&@!*(#Yisajd/,,<';

function sha512(password, salt) {
  const hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  const value = hash.digest('hex');
  return {
    salt: salt,
    passwordHash: value,
  };
}

function checkAdmin(req, res, next) {
  if (!req.user) return res.redirect('/login');
  if (req.user.role !== 'admin') return res.redirect('/profile');
  next();
}

function checkAuth(req, res, next) {
  if (!req.user) return res.redirect('/login');
  next();
}

app.get('/logout', (req, res) => {
  try {
    req.logout();
    res.redirect('/login');
  } catch (e) {
    res.sendStatus(404);
  }
});

app.get('/', function (req, res) {
  if (req.user == null) {
    res.redirect('/login');
  }
  if (req.user != null) {
    res.redirect('/profile');
  }
});

app.get('/login', function (req, res) {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/profile', checkAuth, (req, res, next) => {
  storage.Account.find({ authorId: req.user._id }, (err, data) => {
    res.render('profile', {
      user: req.user,
      accounts: Array.from(data),
    });
  });
});

app.post('/login', passport.authenticate('local'), (req, res) => {
  res.redirect('/profile');
});

app.post('/create', checkAuth, function (req, res) {
  let account = new storage.Account({
    authorId: req.user._id,
    title: req.body.title,
    login: req.body.login,
    password: req.body.password,
    description: req.body.description,
    importance: req.body.importance,
    sell: 'false',
  });
  try {
    storage.Account.count({ authorId: req.user._id }, function (err, c) {
      if (req.user.role === 'user') {
        if (c <= 4) {
          account.save();
        }
      } else {
        account.save();
      }
      res.redirect('/profile#data');
    });
  } catch (e) {
    res.sendStatus(404);
  }
});

app.post('/remove/:remId', checkAuth, function (req, res) {
  storage.Account.remove(
    { _id: req.params.remId, authorId: req.user._id },
    function (err) {
      res.redirect('/profile#data');
    }
  );
});

app.post('/sell/:remId', checkAuth, function (req, res) {
  storage.Account.update(
    { _id: req.params.remId, authorId: req.user._id },
    { $set: { sell: 'true' } },
    function (err) {
      res.redirect('/profile#data');
    }
  );
});

app.post('/update/:upId', checkAuth, function (req, res) {
  storage.Account.update(
    { _id: req.params.upId, authorId: req.user._id },
    {
      title: req.body.title,
      login: req.body.login,
      password: req.body.password,
      description: req.body.description,
      importance: req.body.importance,
    },
    function (err) {
      res.redirect('/profile#data');
    }
  );
});

app.get('/acc/:showId', checkAuth, function (req, res) {
  storage.Account.findOne({
    _id: req.params.showId,
    authorId: req.user._id,
  }).then((account) => {
    res.render('account', {
      acc: account,
    });
  });
});

app.post('/register', async function (req, res) {
  let user = await storage.User.findOne({ username: req.body.name });
  console.log(user);
  if (!user) {
    if (req.body.name && req.body.password && req.body.email) {
      user = new storage.User({
        username: req.body.name,
        password: sha512(req.body.password, serverSalt).passwordHash,
        email: req.body.email,
        tlgUser: null,
        role: 'user',
        avatar:
          'https://media.wired.com/photos/598e35fb99d76447c4eb1f28/master/pass/phonepicutres-TA.jpg',
      });
      console.log(user.toJSON());
      try {
        await user.save();
        storage.objId++;
        res.redirect('/login');
      } catch (e) {
        res.redirect('/login');
      }
    } else {
      res.redirect('/login');
    }
  } else {
    res.redirect('/login');
  }
});

app.post('/promote/:userId', checkAdmin, function (req, res) {
  storage.User.update(
    { _id: req.params.userId },
    { $set: { role: 'vip' } }
  ).then((account) => {
    res.redirect('/users');
  });
});

app.post(
  '/upload',
  checkAuth,
  bodyParser.urlencoded({ extended: false }),
  async (req, res) => {
    if (req.files.fileUpl) {
      cloudinary.v2.uploader.upload(
        'data:image/png;base64,' + req.files.fileUpl.data.toString('base64'),

        function (error, result) {
          storage.User.update(
            { _id: req.user._id },
            {
              avatar: result.url,
            },
            function (err) {
              res.redirect('/profile');
            }
          );
        }
      );
    } else {
      res.redirect('/profile');
    }
  }
);

app.get('/users', checkAdmin, function (req, res) {
  let page = req.query.page ? parseInt(req.query.page) : 0;
  let toSearch = req.query.search ? req.query.search : '';

  storage.User.find((err, data) => {
    let arr = [];
    for (let dat of data) {
      if (String(dat.username).toLowerCase().match(toSearch.toLowerCase())) {
        arr.push(dat);
      }
    }

    let temp = array.chunk(arr, 5);
    let max = temp.length;

    res.render('users', {
      usr: temp[page],
      page: page,
      max: max,
      prevSearch: toSearch,
    });
  });
});

app.post('/synch', checkAuth, function (req, res) {
  storage.User.update(
    { _id: req.user._id },
    { $set: { tlgUser: req.body.telegramUsername } }
  ).then((account) => {
    res.redirect('/profile');
  });
});

app.use(function (err, req, res, next) {
  /*if(err){
        res.redirect('/profile');                
    }*/
});

app.use('/acc', express.static(__dirname + '/public'));
app.use('/api/v1', api);
app.use('/market', market);

app.listen(config.port, () => console.log('Server is up !'));
