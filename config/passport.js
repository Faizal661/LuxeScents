const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const User = require('../models/userSchema');


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            //User already logged in via google 
            let user = await User.findOne({ googleId: profile.id });
            if (user) {
                return done(null, user);
            }

            //Already logged in via emial , but not via google
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
                user.googleId = profile.id;
                await user.save();

                return done(null, user);
            //First time user, logged in via google
            } else {
                user = new User({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id
                });
            }
            await user.save();

            done(null, user);
        } catch (error) {
            console.error("Passport Google Strategy Error:", error);
            return done(error, null);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id)

});

passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => {
            done(null, user)
        })
        .catch(err => {
            done(err, null)
        })
})


module.exports = passport;

