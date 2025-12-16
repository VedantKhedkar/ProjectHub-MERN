import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  console.log(`--- [${new Date().toLocaleTimeString()}] verifyToken: Middleware checking route: ${req.originalUrl}`);

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format is "Bearer TOKEN"

  if (token == null) {
    console.log("verifyToken: FAILED (No token provided)");
    return res.sendStatus(401); // Unauthorized
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("verifyToken: FATAL ERROR (JWT_SECRET is not loaded in .env file!)");
    return res.status(500).json({ message: "Server is missing JWT secret." });
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      console.error("verifyToken: FAILED (Token is invalid or expired)", err.message);
      return res.sendStatus(403); // Forbidden
    }
    
    // This is the success log!
    console.log(`verifyToken: SUCCESS! Token verified for user ID: ${user.id}`);
    req.userId = user.id; // Add user data to the request object
    next(); // Continue to the next function (the database query)
  });
};