const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

  console.log(req.headers.authorization);
  try {
      const token = req.headers.authorization;

      const decodedToken = jwt.verify(token, "secret_this_should_be_longer")
      req.tokenData = {email: decodedToken.email, userId: decodedToken.userId}
      console.log("Decoded token : ", decodedToken)
      next();

    }catch(err){
      console.log(err);
    res.status(401).json({
      message: "Auth failed!"
    })
  }

}
