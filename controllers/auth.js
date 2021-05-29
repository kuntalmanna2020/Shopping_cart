const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const nodemailer = require("nodemailer");
const { reset } = require("nodemon");
require("dotenv").config();
// const sendgridTransport=require('nodemailer-sendgrid');
// const sendgrid=require('@sendgrid/mail')
const {validationResult}=require('express-validator/check');

const User = require("../models/user");


// const transporter=nodemailer.createTransport(sendgridTransport({
//   auth:{
//      api_key:"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",
//   }
// }))

// SENDGRID_APY_KEY:"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"

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
    // pass:process.env.PASSWORD
  },
});

exports.getLogin = (req, res, next) => {
  // console.log(req.flash('error'));
  let messege = req.flash("error");

  if (messege.length > 0) {
    messege = messege[0];
  } else {
    messege = null;
  }

  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    // isAuthenticated: false,
    // errorMessege:req.flash('error')
    errorMessege: messege,
    oldInput:{
      email:'',
      password:'',

    },
    validationErrors:[]
  });
};

exports.getSignup = (req, res, next) => {
  let messege2 = req.flash("error");

  if (messege2.length > 0) {
    messege2 = messege2[0];
  } else {
    messege2 = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    signuperrorMessege: messege2,
    oldInput:{
      email:'',
      password:'',
      confirmPassword:''

    },
    validationErrors:[]
    // isAuthenticated: false
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors=validationResult(req);
  if (!errors.isEmpty())
  {
    return res.status(422).render('auth/login',{
      path:'/login',
      pageTitle:'Login',
      errorMessege:errors.array(0).msg,
      oldInput:{
        email:email,
        password:password
      },
      validationErrors:errors.array()

    });
  
    
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        // req.flash("error", "invalid email or password credentials");
        // return res.redirect("/login");
        return  res.status(422).render('auth/login',{
          path:'/login',
          pageTitle:'Login',
          errorMessege:'invalid email or password credentials',
          oldInput:
          {
            email:email,
            password:password
          },
          validationErrors : []
        })
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          }
          // req.flash('error1','invalid password')
          // req.flash("error", "invalid email or password credentials");
          // res.redirect("/login");
          return  res.status(422).render('auth/login',{
            path:'/login',
            pageTitle:'Login',
            errorMessege:'invalid email or password credentials',
            oldInput:
            {
              email:email,
              password:password
            },
            validationErrors : []
          })

        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) =>
    {
      const error=new Error(err);
      error.httpStatusCode=500;
      return next(error);
    })
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  // const confirmPassword = req.body.confirmPassword;
  const errors=validationResult(req);
  if(!errors.isEmpty())
  {
    console.log(errors.array());
    return res.status(422).render("auth/signup", {

      path: "/signup",
      pageTitle: "Signup",
      signuperrorMessege: errors.array()[0].msg,
      oldInput: {
        email:email,
        password: password,
        confirmPassword: req.body.confirmPassword
      },
      validationErrors:errors.array()
  
      // isAuthenticated: false
    })
  }
  // User.findOne({ email: email })
  //   .then((userDoc) => {
  //     if (userDoc) {
  //       req.flash("error", "email is already exist");
  //       return res.redirect("/signup");
  //     }
       bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then((result) => {
          // req.flash("success", "sent mail");
          // res.redirect('/login');
          res.redirect("/login");
          let mailOptions = {
            to: email,
            // from:"shop-@nodecomplete.com",
            from: "kuntalm2017@gmail.com",
            subject: "signup Succeded!",
            text: "hii welcome to sendgrid",
            html: "<h1>Hi! You successfully signed up</h1>",
          };
          // return transporter.sendMail({
          //   to:email,
          //   from:"shop-@nodecomplete.com",
          //   subject:'signup Succeded!',
          //   text:"hii welcome to sendgrid",
          //   html:"<>Hi! You successfully signed up</>"

          return  transporter.sendMail(mailOptions, (err, data) => {
            if (err) {
              console.log(err);
            } else {
              console.log("email sent");
              // let success = req.flash("success");

              // if (success.length > 0) {
              //   success = success[0];
              // } else {
              //   success = null;
              // }
            }
          });
          // req.flash("success", "sent mail");
          // res.redirect('/login');
        })
        .catch((err) =>    {
          const error=new Error(err);
          error.httpStatusCode=500;
          return next(error);
        });
    // })
    // .catch((err) => {
    //   console.log(err);
    // });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getReset = (req, res) => {
  let messege3 = req.flash("error");

  if (messege3.length > 0) {
    messege3 = messege3[0];
  } else {
    messege3 = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "reset password",
    errorMessege: messege3,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.render("/reset");
    }
    const token = buffer.toString("hex");

    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "no account with that email is found");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        let resetMailOptions = {
          to: req.body.email,
          // from:"shop-@nodecomplete.com",
          from: "kuntalm2017@gmail.com",
          subject: "password reset",
          // text:"hii welcome to my chanel",
          html: `<p>Hi! you have requested a password reset</p>
                  <p>click the <a href="http://localhost:5000/reset/${token}">link to set a new password</p>`,
        };
        res.redirect("/");

        transporter.sendMail(resetMailOptions, (err, data) => {
          if (err) {
            console.log(err);
          } else {
            console.log("email sent");
          }
        });
      })
      .catch((err) =>     {
        const error=new Error(err);
        error.httpStatusCode=500;
        return next(error);
      });
  });
};

exports.getnewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let messege4 = req.flash("error");

      if (messege4.length > 0) {
        messege4 = messege4[0];
      } else {
        messege4 = null;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "new password",
        errorMessege: messege4,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) =>    {
      const error=new Error(err);
      error.httpStatusCode=500;
      return next(error);
    });
  // let messege4=req.flash('error');

  // if (messege4.length>0)
  // {
  //   messege4=messege4[0]

  // }
  // else
  // {
  //   messege4=null;
  // }
  // res.render('auth/new-password',{
  //   path:'/new-password',
  //   pageTitle:'new password',
  //   errorMessege:messege4,

  // })
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) =>     {
      const error=new Error(err);
      error.httpStatusCode=500;
      return next(error);
    });
};
