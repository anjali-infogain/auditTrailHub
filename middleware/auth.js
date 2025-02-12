// Middleware to Protect Routes
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  res.redirect('/auth/login');
};

module.exports = isAuthenticated;