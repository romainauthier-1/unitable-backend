var express = require("express");
var router = express.Router();
require("../models/connection");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/* GET users listing. */
router.get("/", function (req, res, next) {
	res.send("respond with a resource");
});
// route get pour chercher tous les users
router.get("/search/all", (req, res) => {
	User.find()
		.select("-password")
		.then((data) => {
		if (data) {
			res.json({ result: true, users: data });
		} else {
			res.json({ result: false, error: "No users found" });
		}
	});
});
// route get pour chercher par email avec params ?email=xxx
router.get("/search/by/:email", (req, res) => {
	//const email = req.params.email;
	const email = decodeURIComponent(req.params.email).trim().toLowerCase();
	User.findOne({ email })
		.select("-password")
		.then((data) => {
		if (data) {
			res.json({ result: true, user: data });
		} else {
			res.json({ result: false, error: "User not found" });
		}
	});
});

// créer une route PUT pour changer le mot de passe d'un user
router.put("/password", async (req, res) => {
	const { token, password } = req.body;
	const decoded = jwt.verify(token, process.env.JWT_SECRET);
	if (!decoded.email || !password) {
		return res.json({ result: false, error: "Missing email or password" });
	}
	try {
		const user = await User.findOne({ email: decoded.email });
		if (!user) {
			return res.json({ result: false, error: "User not found" });
		}
		const hash = bcrypt.hashSync(password, 10);
		await User.updateOne(
			{ email: decoded.email },
			{ password: hash, firstConnection: false },
		);
		res.json({
			result: true,
			isAdmin: user.isAdmin,
			message: "Password updated successfully",
		});
	} catch (err) {
		console.error(err);
		res.json({ result: false, error: "Error updating password" });
	}
});

router.put("/organization", async (req, res) => {
	const { email, organizationId } = req.body;

	if (!email || !organizationId) {
		//add status 400 pour bad request

		return res.status(400).json({
			result: false,
			error: "Missing email or organization",
		});
	}
	try {
		const user = await User.findOne({ email: email });
		if (!user) {
			return res.json({ result: false, error: "User not found" });
		}
		await User.updateOne(
			{ email: email },
			{ organization: organizationId },
		);
		res.json({
			result: true,
			message: "Organization updated successfully",
		});
	} catch (err) {
		console.error(err);
		res.json({ result: false, error: "Error updating organization" });
	}
});


router.post("/signup", (req, res) => {
	if (!checkBody(req.body, ["email", "password"])) {
		res.json({ result: false, error: "Missing or empty fields" });
		return;
	}

	// Check if the user has not already been registered
	User.findOne({ email: req.body.email }).then((data) => {
		if (data === null) {
			const hash = bcrypt.hashSync(req.body.password, 10);

			const newUser = new User({
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				password: hash,
				email: req.body.email,
				token: uid2(32),
				secuNumber: req.body.secuNumber,
				birthDate: req.body.birthDate,
				address: req.body.address,
				phone: req.body.phone,
				position: req.body.position,
				profil: req.body.profil,
				dateContract: req.body.dateContract,
				typeContract: req.body.typeContract,
				hourVolumn: req.body.hourVolumn,
				contact: req.body.contact,
				organisationName: req.body.organisationName,
				isAdmin: req.body.isAdmin,
				firstConnection: req.body.firstConnection,
			});

			/*Contact Urgent: 
    Nom 
    Prénom  
    Numéro Téléphone

*/

			newUser.save().then((newDoc) => {
				res.json({ result: true, token: newDoc.token, id: newDoc._id });
			});
		} else {
			// User already exists in database
			res.json({ result: false, error: "User already exists" });
		}
	});
});

router.post("/signin", (req, res) => {
	if (!checkBody(req.body, ["email", "password"])) {
		res.json({ result: false, error: "Missing or empty fields" });
		return;
	}

	User.findOne({ email: req.body.email }).then((data) => {
		if (data && bcrypt.compareSync(req.body.password, data.password)) {
			res.json({
				result: true,
				token: data.token,
				user: {
					_id: data._id,
					firstName: data.firstName,
					lastName: data.lastName,
					email: data.email,
				},
			});
		} else {
			res.json({
				result: false,
				error: "User not found or wrong password",
			});
		}
	});
});

// GET user avec email À SUPPRIMER
router.get("/:email", async (req, res) => {
	const { email } = req.params;

	try {
		const user = await User.findOne({ email }).select("-password");

		if (!user) {
			return res.status(404).json({
				result: false,
				message: "Utilisateur.ice non trouvé.e",
			});
		}

		res.status(200).json({ result: true, user });
	} catch (err) {
		res.status(500).json({ result: false, message: err.message });
	}
});

module.exports = router;
