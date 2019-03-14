const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	try {
		const token = req.cookies.Authorization.split(" ")[1];

		console.log(req.cookies);

		const decoded = jwt.verify(token, 'gvaraNode');
		req.userData = decoded;
		
		next();
	} catch (error) {
		console.log("error -", error);

		return res.status(401).json({
			authCode : false,
			message  : 'Auth failed',
			err      : error
		});
	}
};
