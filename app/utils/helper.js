const handleResponse = (
  res,
  {
    statusCode = 200,
    success = true,
    message = "Success",
    errors = null,
    data = null,
  }
) => {
  return res.status(statusCode).json({
    success,
    message,
    errors,
    data,
  });
};

export default handleResponse;