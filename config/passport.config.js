import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userSchema.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Case 1: User found by Google ID (already logged in via Google)
            console.log("🚀 ~ found:", found)
            let user = await User.findOne({ googleId: profile.id });
            if (user) {
                return done(null, user);
            }

            // Case 2: User found by Email (previously signed up locally)
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
                // Link the existing account to Google ID
                user.googleId = profile.id;
                await user.save();
                return done(null, user);
            }

            // Case 3: Brand new user
            user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id
            });
            await user.save();

            done(null, user);
        } catch (error) {
            console.error("Passport Google Strategy Error:", error);
            return done(error, null);
        }
    }
));

// --- Session Management ---

passport.serializeUser((user, done) => {
    // Stores the MongoDB ID in the session
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    // Fetches the full user object on every request using the stored ID
    User.findById(id)
        .then(user => {
            done(null, user);
        })
        .catch(err => {
            done(err, null);
        });
});


export default passport;