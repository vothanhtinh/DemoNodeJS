const authController = require("../controllers/authController");
const middlewareController = require('../controllers/middlewareController');

const  bodyParser = require('body-parser')
const router= require("express").Router();
const jsonParser = bodyParser.json()

router.post("/login",jsonParser,authController.loginUser);
router.post("/register", jsonParser, authController.registerUser);

//Refresh

router.post("/refresh",jsonParser,authController.requestRefreshToken);

router.post("/logout",middlewareController.verifyToken,authController.userLogout)

module.exports= router;