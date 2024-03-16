const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    console.log("User is authenticated");
    next(); // User is authenticated, proceed to the next middleware/route handler
  } else {
    console.error("User is not authenticated");
    res.status(401).send('You are not authenticated'); // User is not authenticated
  }
};

module.exports = {
  isAuthenticated
};