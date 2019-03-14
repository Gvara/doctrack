const express 	= require('express');
const router 	= express.Router();
const mongoose 	= require('mongoose');
const bcrypt 	= require('bcrypt');
const jwt		= require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');

const User = require('../../models/user');
const UsersDataController = require('../controllers/users_data');

router.get('/', checkAuth, UsersDataController.users_get_all);

router.get('/:id', checkAuth, UsersDataController.user_get_by_id);

router.delete('/:id', checkAuth, UsersDataController.user_delete_by_id);

module.exports = router;