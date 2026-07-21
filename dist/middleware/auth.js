import jwt, {} from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "development-secret";
export function isAuthenticated(req, res, next) {
    const authorization = req.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Authentication required. Provide a Bearer token.",
        });
    }
    const token = authorization.slice("Bearer ".length).trim();
    if (!token) {
        return res.status(401).json({ error: "Authentication token is required" });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded === "string" ||
            typeof decoded.userId !== "string" ||
            typeof decoded.email !== "string" ||
            typeof decoded.role !== "string") {
            return res.status(401).json({ error: "Invalid authentication token" });
        }
        req.auth = decoded;
        return next();
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res
                .status(401)
                .json({ error: "Authentication token has expired" });
        }
        return res.status(401).json({ error: "Invalid authentication token" });
    }
}
//# sourceMappingURL=auth.js.map