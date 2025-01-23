const passport = require('passport');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const session = require('express-session');
const dotenv = require('dotenv');

dotenv.config();

passport.use(
  new OIDCStrategy(
    {
      identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0/.well-known/openid-configuration`,
      clientID: process.env.AZURE_AD_CLIENT_ID,
      responseType: 'code',
      responseMode: 'query',
      redirectUrl: 'http://localhost:3000/auth/callback',
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      allowHttpForRedirectUrl: true,
      passReqToCallback: false,
    },
    (iss, sub, profile, accessToken, refreshToken, done) => {
      if (!profile) return done(new Error('No profile found'), null);
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

const configureAuthentication = (app) => {
  // Session configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
    })
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Authentication Routes
  app.get('/auth/login', passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }));
  app.get(
    '/auth/callback',
    passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }),
    (req, res) => {
      res.redirect('/dashboard');
    }
  );
  app.get('/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  });
};

// Middleware to protect routes
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/auth/login');
};

module.exports = { configureAuthentication, isAuthenticated };
