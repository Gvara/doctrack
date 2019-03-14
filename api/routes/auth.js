const express 	= require('express');
const router 	= express.Router();
const mongoose 	= require('mongoose');
const bcrypt 	= require('bcrypt');
const jwt		= require('jsonwebtoken');

const checkAuth = require('../middleware/check-auth');
const User = require('../../models/user');
const UserAuthController = require('../controllers/auth');

router.post('/signup', UserAuthController.user_singnup);

router.post('/login', UserAuthController.user_login);

router.get('/token', UserAuthController.user_check_token);

module.exports = router;
