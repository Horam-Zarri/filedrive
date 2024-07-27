import {NextFunction, Request, Response} from "express";
import * as Validator from "class-validator";
import Prisma from "../prisma/db";
import passport from "passport";

class UserValidate {

    constructor(username: string, email: string, password: string) {
        this.username = username;
        this.email = email;
        this.password = password
    }

    @Validator.Length(5, 50)
    @Validator.IsNotEmpty()
    @Validator.IsDefined()
    username: string;

    @Validator.IsEmail()
    @Validator.IsDefined()
    email: string;

    @Validator.IsNotEmpty()
    @Validator.MinLength(6)
    @Validator.IsDefined()
    @Validator.Matches(/^[a-zA-Z0-9!@#$%^&*]{6,}$/)
    password: string;
}


export const sign_up_get = async function(req: Request, res: Response) {
    res.render("sign-up", {err: null});
}

export const sign_up_post = async function (req: Request, res: Response, next: NextFunction) {
    const { username, email, password } = req.body;

    Validator.validate(new UserValidate(username, email, password)).then(errs => {
        if (errs.length > 0) {
            console.log(errs);
            res.render('sign-up', { err: "Invalid Arguments!" });
        } 
        else {
            Prisma.user.create({
                data: {
                    username,
                    email,
                    password,
                    rootFolder: {
                        create: {
                            name: "root"
                        }
                    }
                }
            }).then(() => {
                res.redirect('/');
            });
        }
    });


}


export const login_get = async function (req: Request, res: Response) {
    res.render("login", { err: null });
}

export const login_auth_post = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
});

export const log_out_get = async function (req: Request, res: Response, next: NextFunction) {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    })
}
