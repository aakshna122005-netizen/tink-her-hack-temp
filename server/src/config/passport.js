const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('./db');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await prisma.user.findUnique({
                    where: { googleId: profile.id },
                });

                if (!user) {
                    user = await prisma.user.findUnique({
                        where: { email: profile.emails[0].value },
                    });

                    if (user) {
                        user = await prisma.user.update({
                            where: { id: user.id },
                            data: { googleId: profile.id, avatar: profile.photos?.[0]?.value },
                        });
                    } else {
                        user = await prisma.user.create({
                            data: {
                                email: profile.emails[0].value,
                                name: profile.displayName,
                                googleId: profile.id,
                                avatar: profile.photos?.[0]?.value,
                            },
                        });
                    }
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
