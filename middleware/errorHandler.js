const errorHandler = (err, req, res, next) => {
  console.error(`Error occurred: ${err.message}`);
  console.error(err.stack);
  // Determine the status code based on the type of error
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

module.exports = errorHandler;