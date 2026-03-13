module.exports = function adminAuth(req, res, next) {

const incomingKey = req.headers["x-admin-key"];
const adminKey = process.env.ADMIN_KEY;

if (!adminKey) {
return res.status(500).json({ message: "ADMIN_KEY missing" });
}

if (incomingKey !== adminKey) {
return res.status(401).json({ message: "Unauthorized" });
}

next();
};