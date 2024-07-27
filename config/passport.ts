import passport from "passport";
import LocalStrategy from "passport-local";
import Prisma from "../prisma/db"
import bcrypt from 'bcryptjs';

const verify: LocalStrategy.VerifyFunction = async (username, password, done) => {
   try {
    console.log("Start verify");
    const user = await Prisma.user.findFirst({
        where: {
            username: username,
        }
    });

    if (!user) {
        console.log("User does not exist!");
        done(null, false, {message: "User does not exist!"});
    } else {
    console.log("FOund user");
        if (password != user.password) {
            done(null, false, {message: "Incorrect password!"});
        }
        done(null, user);
    }
   } catch (err) { 
        done(err);
   }
}

const serialize = (user: Express.User, done: any) => {
    done(null, (user as any).id);
}

const deserialize = async (id: any, done: any) => {
    try {
        const user = await Prisma.user.findUnique({
            where: {
                id
            }
        });

        if (!user) {
            done(new Error("User not found in passport.deserialize"));
        }

        done(null, user)
    } catch (err) {
        done(err);
    }
}
function initialize(passport: passport.PassportStatic) {
    passport.use(
        new LocalStrategy.Strategy(verify)
    );

    passport.serializeUser(serialize);
    passport.deserializeUser(deserialize)
}

export default initialize;