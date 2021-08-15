const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User= require('../model/user');

exports.signin = (req, res, next) => {
  console.log("User requesting signup : ", req.body);
  bcrypt.hash(req.body.password, 10)
    .then(hash => {

      const user = new User({
        email: req.body.email,
        password: hash
      });

      user.save()
        .then(result => {
          res.status(201).json({
            message: "User created successfully!",
            result: result
          });
        })
        .catch(error => {
          res.status(500).json({
            error: error
          });
        });

    });
  }

exports.login = (req, res, next) => {
  let userData ={} ;
  console.log("User requested for login : ", req.body);

  User.findOne({email: req.body.email})
    .then(user => {
        console.log("User found : ",user);
        if(!user) {
          return res.status(404).json({
            message: "User not found!"
          });
        }
        userData = user;
        return bcrypt.compare(req.body.password, user.password);
    }).then(result => {
      console.log("User found : ",result);
      if(!result){
        res.status(404).json({
          message: "Auth failed!"
        });
      }

      const token = jwt.sign(

          {email: userData.email, userId: userData._id},
          "secret_this_should_be_longer",
          {expiresIn: "1h"}
      )

      res.status(200).json({
        token: token,
        userId: userData._id
      });
    }).catch(error => {
      return res.status(401).json({
        message: "Auth Failed!"
      })
    })

}
