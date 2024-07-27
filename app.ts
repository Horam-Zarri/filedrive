const createError = require('http-errors');
import express, { } from "express";
import Prisma from './prisma/db';
import passport from "passport";
import initializePassport from './config/passport';
const path = require('path');
const logger = require('morgan');


initializePassport(passport);
const session = require('express-session');
import { PrismaSessionStore } from "@quixo3/prisma-session-store";


import authRouter from "./routes/auth";
import driveRouter from "./routes/drive";

const app = express();

//app.set('port', 3000);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000
    }, 
    secret: 'some cats',
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(
        Prisma,
        {
            checkPeriod: 2 * 60 * 1000,
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }
    )
}));

app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use('/', authRouter);
app.use('/drive', driveRouter);

app.get('/', function(req: express.Request, res: express.Response) {
  res.render("index", {title: "File Drive", user: req.user});
});
// catch 404 and forward to error handler
app.use(function(req: express.Request, res: express.Response, next: express.NextFunction) {
  next(createError(404));
});

// error handler
app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = err;

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const PORT = 3000;
app.listen(PORT, () => console.log('Listening...'));
