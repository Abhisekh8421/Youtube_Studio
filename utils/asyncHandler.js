const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
    //like a higher order function
    try {
      await requestHandler(req, res, next); // waits for completion of the code if it produces any error then it goes to catch block then it pass to next middleware
    } catch (error) {
      next(error); //pass  the error to next middleware
    }
  };
};

export { asyncHandler };
