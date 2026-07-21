import { Router } from "express";
import { getUser, 
// googleAuthController,
LoginUser, RegisterUser, } from "../controllers/auth.js";
import passport from "passport";
import { signToken } from "../controllers/auth.js";
import { isAuthenticated } from "../middleware/auth.js";
const router = Router();
router.post("/register", RegisterUser);
router.post("/login", LoginUser);
router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
}));
router.get("/google/callback", passport.authenticate("google", {
    session: false,
}), (req, res) => {
    const user = req.user;
    if (!user) {
        return;
    }
    const token = signToken(user);
    res.redirect(`http://localhost:3000/auth/success?token=${token}`);
});
router.get("/user", isAuthenticated, getUser);
export default router;
//# sourceMappingURL=auth.js.map