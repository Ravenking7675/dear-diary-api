const express = require('express');

const UserAuth = require('../controllers/user')

const router = express.Router();

//Signup
router.post("/signup", UserAuth.signin)

    //Login
router.post("/login", UserAuth.login)


module.exports = router;
