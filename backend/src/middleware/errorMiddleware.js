function sendErrorDev(err, res) {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
}

function sendErrorProd(err, res) {
  if (!err.isOperational) {
    err.message = "something went wrong.";
    err.statusCode = 500;
    err.status = "error";
  }

  return res
    .status(err.statusCode)
    .json({ status: err.status, message: err.message });
}

export default function errorMiddleware(err, req, res, next) {
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "production") {
    return sendErrorProd(err, res);
  } else {
    return sendErrorDev(err, res);
  }
}
