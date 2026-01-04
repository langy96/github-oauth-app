require('dotenv').config();

/* ======================
   Package Imports
====================== */
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const path = require('path');

/* ======================
   App Setup
====================== */
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));

/* ======================
   Express Session Setup
====================== */
app.use(
  session({
    secret: 'codecademy',
    resave: false,
    saveUninitialized: false,
  })
);

/* ======================
   Passport Initialization
====================== */
app.use(passport.initialize());
app.use(passport.session());

/* ======================
   Passport Configuration
====================== */
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/github/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

/* ======================
   Routes
====================== */
app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

app.get('/login', (req, res) => {
  res.render('login');
});

/* --- GitHub OAuth --- */
app.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['user'] })
);

app.get(
  '/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/login',
    successRedirect: '/',
  })
);

/* --- Protected Route --- */
app.get('/account', ensureAuthenticated, (req, res) => {
  res.render('account', { user: req.user });
});

app.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

/* ======================
   Auth Middleware
====================== */
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

/* ======================
   Server
====================== */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
