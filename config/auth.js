const passport = require('passport');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const session = require('express-session');
const dotenv = require('dotenv');
const User = require('../models/User'); // Import User model

dotenv.config();

passport.use(
  new OIDCStrategy(
    {
      identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0/.well-known/openid-configuration`,
      clientID: process.env.AZURE_AD_CLIENT_ID,
      responseType: 'code',
      responseMode: 'query',
      redirectUrl: process.env.AZURE_AD_REDIRECT_URI,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      allowHttpForRedirectUrl: process.env.NODE_ENV !== 'production',
      scope: ['openid', 'profile', 'email', 'User.Read'],
      passReqToCallback: false,
    },
    async (iss, sub, profile, accessToken, refreshToken, done) => {
      if (!profile) return done(new Error('No profile found'), null);
      
      console.log('Access Token:', accessToken);

      try {
        const { oid, displayName, preferred_username } = profile;
        const email = profile._json.email || preferred_username || '';

        // Check if user exists in DB
        let user = await User.findOne({ _id: oid });

        if (!user) {
          user = new User({
            _id: oid, // Azure AD ID as MongoDB ID
            firstName: displayName ? displayName.split(' ')[0] : '',
            lastName: displayName ? displayName.split(' ')[1] : '',
            email,
            password: null, // No password needed for SSO
            role: 'Viewer', // Default role, change as needed
            createdBy: oid,
            updatedBy: oid,
          });
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        console.error('SSO Registration Error:', error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

const configureAuthentication = (app) => {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.get(
    '/auth/login',
    passport.authenticate('azuread-openidconnect', {
      failureRedirect: '/',
      scope: ['openid', 'profile', 'email', 'User.Read'],
    })
  );

  app.get(
    '/auth/callback',
    passport.authenticate('azuread-openidconnect', {
      failureRedirect: '/auth/error',
    }),
    (req, res) => {
      res.redirect('/dashboard');
    }
  );

  app.get('/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect(
        `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/logout?post_logout_redirect_uri=${process.env.AZURE_AD_REDIRECT_URI}`
      );
    });
  });

  app.get('/auth/error', (req, res) => {
    res.send('<h1>Authentication Failed</h1><p>Please try again or contact support.</p>');
  });
};

module.exports = { configureAuthentication };
