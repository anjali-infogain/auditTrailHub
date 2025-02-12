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
      redirectUrl: process.env.AZURE_AD_REDIRECT_URI,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      allowHttpForRedirectUrl: process.env.NODE_ENV !== 'production',
      scope: ['openid', 'profile', 'email', 'User.Read'], // Add required scopes
      passReqToCallback: false,
    },
    async (iss, sub, profile, accessToken, refreshToken, done) => {
      if (!profile) return done(new Error('No profile found'), null);

      console.log('Azure AD Profile:', profile); // Debug output

      // Fetch additional user details using Microsoft Graph API
      const user = {
        id: profile.oid || profile.sub,
        displayName: profile.displayName || profile.name || '',
        email: profile._json.email || profile._json.preferred_username || '',
        accessToken
      };

      return done(null, user);
    }
  )
);

// Serialize & Deserialize User
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Authentication Configuration
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

  // Authentication Routes
  app.get('/auth/login', passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }));

  app.get(
    '/auth/callback',
    passport.authenticate('azuread-openidconnect', { failureRedirect: '/auth/error' }),
    (req, res) => {
      res.redirect('/dashboard');
    }
  );

  // Logout
  app.get('/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  });

  // Error Route
  app.get('/auth/error', (req, res) => {
    res.send('<h1>Authentication Failed</h1><p>Please try again or contact support.</p>');
  });
};


module.exports = { configureAuthentication };
