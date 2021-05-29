const express = require("express");
const { check, body } = require("express-validator/check");

const authController = require("../controllers/auth");

const User=require('../models/user')

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post("/login",
[
  body('email').isEmail().withMessage('Please enter a valid email adress').normalizeEmail(),
  body('password','password has to be valid').isLength({min:5}).isAlphanumeric().trim()
], authController.postLogin);

// router.post(
//   "/signup",
//   [check("email").isEmail().withMessage("please enter a valid email").custom((value,{req})=>
//   {
//     //   if (value==='test@gmail.com')
//     // {
//     //     throw new Error('this email address is forbidden');

//     //   }
//     //   return true;

//     return User.findOne({ email: value })
//     .then((userDoc) => {
//       if (userDoc) {
//         // req.flash("error", "email is already exist");
//         // return res.redirect("/signup");

//         return Promise.reject('Email exist Already and pick different one')
//        }
//   });
// }),body('password','Please Enter a password with only numbers at least 5 charecters').isLength({min:5})
//      //   .withMessage('Please Enter a password with only numbers at least 5 charecters')
// .isAlphanumeric(),body('confirmPassword').custom((value,{req})=>
// {
//     if (value!==req.body.passwword)
//     {
//        throw new Error('Password Do not match!');   
//     }
//     return true;
//   })
// ],
//   authController.postSignup
// );



router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        // if (value === 'test@test.com') {
        //   throw new Error('This email address if forbidden.');
        // }
        // return true;
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject('E-Mail exists already, please pick a different one.');
          }
        });
      }).normalizeEmail(),
    body(
      'password',
      'Please enter a password with only numbers and text and at least 5 characters.'
    )
      .isLength({ min: 5 })
      .isAlphanumeric().trim(),
    body('confirmPassword').trim().custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords have to match!');
      }
      return true;
    })
  ],
  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getnewPassword);

router.post("/new-password", authController.postNewPassword);
module.exports = router;
