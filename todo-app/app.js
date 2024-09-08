/* eslint-disable no-unused-vars */
const express = require("express");
const app = express();
const { Todo,User } = require("./models");

const bodyParser = require("body-parser");
var csrf = require("tiny-csrf");
var cookieParser=require("cookie-parser");

const passport=require('passport');
const connectEnsureLogin=require('connect-ensure-login');
const session=require('express-session');
const LocalStrategy=require('passport-local');
const bcrypt=require('bcryptjs');

const saltRounds=10;

const path = require("path");
const flash=require("connect-flash");

app.use(flash());

app.set("views",path.join(__dirname,"views"));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(csrf("this_should_be_32_character_long",["POST","PUT","DELETE"]));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

// session

app.use(session({
  secret: "my-super-secret-key-875984664558545848",
  cookie:{
    maxAge:24*60*60*1000,
  },
  resave: true,
  saveUninitialized: true,
}));


// passport


app.use(passport.initialize());
app.use(passport.session());

app.use(function(request, response, next) {
  response.locals.messages = request.flash();
  next();
});

passport.use(new LocalStrategy({
  usernameField:'email',
  passwordField:'password'
},(username,password,done)=>{
  User.findOne({ where: { email: username } })
  .then(async function (user) {
    const result = await bcrypt.compare(password, user.password);
    if (result) {
      return done(null, user);
    } else {
      return done(null, false, { message: "Invalid Password" });
    }
  })
  .catch((error) => {
    return done(null, false, { message: "Invalid Mail" });
  });
}));

passport.serializeUser((user,done)=>{
  // console.log("Serializing user in session",user.id)
  done(null,user.id)
});

passport.deserializeUser((id,done)=>{
  User.findByPk(id)
  .then(user=>{
    done(null,user)
  })
  .catch(error=>{
    done(error,null)
  })
});


// home route


app.get("/", async (request, response) => {
  if (request.isAuthenticated()) {
    return response.redirect("/todos");
  }
  response.render("index", {
    csrfToken: request.csrfToken(),
  });
});


// todos route


app.get("/todos", connectEnsureLogin.ensureLoggedIn(),async (request, response) => {
  const loggedInUser = request.user.id;
  const Overdue = await Todo.OverdueTodos(loggedInUser);
  const DueToday = await Todo.dueTodayTodos(loggedInUser);
  const DueLater = await Todo.dueLaterTodos(loggedInUser);
  const Complete = await Todo.CompletedTodos(loggedInUser);
  if (request.accepts("html")) {
    response.render("todos", {
      title:"Todo application",
      Overdue,
      DueToday,
      DueLater,
      Complete,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({
      Overdue,
      DueToday,
      DueLater,
      Complete,
    });
  }
});


// signup route


app.get("/signup",(request,response)=>{
  if (request.isAuthenticated()) {
    return response.redirect("/todos");
  }
  response.render("signup",{title:"Signup",csrfToken: request.csrfToken() });
});

app.post("/users",async (request,response)=>{
  const hashedPwd=await bcrypt.hash(request.body.password, saltRounds)
  console.log(hashedPwd)
  const trimmedPassword = request.body.password.trim();
  if (request.body.firstName.length == 0) {
    request.flash("error", "First Name cant be empty");
    return response.redirect("/signup");
  }
  else if (request.body.email.length == 0) {
    request.flash("error", "Email cant be empty");
    return response.redirect("/signup");
  }
  else if (trimmedPassword.length == 0) {
    request.flash("error", "password cannot be empty");
    return response.redirect("/signup");
  }
  try{
    const user=await User.create({
      firstName:request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password:hashedPwd
    });
    request.login(user,(err)=>{
      if(err){
        console.log(err)
      }
      response.redirect("/todos");
    });
  } catch(error){
    console.log(error);
  }
})


// login block


app.get("/login",(request,response)=>{
  if (request.isAuthenticated()) {
    return response.redirect("/todos");
  }
  response.render("login",{title:"Login",csrfToken:request.csrfToken()});
});


app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (request, response) {
    console.log(request.user);
    response.redirect("/todos");
  }
);


// logout/signout


app.get("/signout",(request,response, next)=>{
  request.logout((err)=>{
    if(err) { return next(err); }
    response.redirect("/");
  })
})

app.get("/", function (request, response) {
  response.send("Hello World");
});

app.get("/todos", async function (_request, response) {

  try {
    console.log("Processing list of all Todos ...");
    const todos = await Todo.findAll();
    return response.json(todos);
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});


// creating of a Todo


app.post("/todos", connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  console.log("Creating a todo",request.body);
  console.log(request.user);
  if (request.body.title.trim().length === 0) {
    request.flash("error", "Todo title should not be empty");
    return response.redirect("/todos");
  }
  if (request.body.dueDate.trim().length === 0) {
    request.flash("error", "Todo due date should not be empty");
    return response.redirect("/todos");
  }
  try {
    await Todo.addTodo({
      title:request.body.title,
      dueDate:request.body.dueDate,
      userId:request.user.id
    });

    return response.redirect("/todos");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id",connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.setCompletionStatus(request.body.completed);
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});


// To delete a todo

app.delete("/todos/:id",connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
  console.log("Deleting a Todo with ID: ",request.params.id);
  const loggedInUser = request.user.id;
  try {
    await Todo.remove(request.params.id,loggedInUser);
    return response.json({success:true});
  } catch (error) {
    console.log(error);
    return response.status(500).json(error);
  }

});

module.exports = app;
