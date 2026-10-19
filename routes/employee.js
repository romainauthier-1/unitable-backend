
var express = require("express");
var router = express.Router();
require("../models/connection");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

router.get("/:organizationId", async (req, res) => {
	const { organizationId } = req.params;
	try {
		const employees = await User.find({ organization: organizationId }).select("-password");
		res.json({ result: true, employees });
	} catch (error) {
		console.error("ERREUR GET EMPLOYEE:", error.message);
		res.status(500).json({ result: false, error: error.message });
	}
});

router.post("/", async (req, res) => {
	console.log("req.body:", req.body);
	try {
		const {
			firstName,
			lastName,
			email,
			address,
			phone,
			position,
			profil,
			birthDate,
			secuNumber,
			dateContract,
			typeContract,
			hourVolumn,
			contact,
			organization,
		} = req.body;

		const normalizedSecuNumber =
			typeof secuNumber === "string" && secuNumber.trim() === ""
				? undefined
				: secuNumber;

		// On check si ces champs sont remplis
		if (!email || !firstName || !lastName) {
			return res.status(400).json({
				result: false,
				error: "Missing required fields",
			});
		}

		// Check si l'employé existe déjà
		const existingUser = await User.findOne({ email });

		if (existingUser) {
			return res.json({ result: false, error: "User already exists" });
		}

		// On génère un mot de passe temporaire
		const tempPassword = uid2(8);
		const hash = bcrypt.hashSync(tempPassword, 10);

		const newEmployee = new User({
			firstName,
			lastName,
			email,
			password: hash,
			token: uid2(32),
			address,
			phone,
			position,
			profil,
			birthDate,
			secuNumber: normalizedSecuNumber,
			dateContract,
			typeContract,
			hourVolumn,
			contact,
			isAdmin: profil === "admin",
			firstConnection: true,
			organization,
		});

		const savedEmployee = await newEmployee.save();
		const { password: _, ...employeeWithoutPassword } = savedEmployee.toObject();

		res.status(201).json({
			result: true,
			message: "Employee created successfully",
			employee: employeeWithoutPassword,
			tempPassword,
		});
	} catch (error) {
		// console.error(error);
		// res.status(500).json({
		// 	result: false,
		// 	error: "Server error",
		// });
		console.error("ERREUR EMPLOYEE:", error.message);
		res.status(500).json({ result: false, error: error.message });
	}
});

// DELETE /employee/:id
router.delete("/:id", async (req, res) => {
	try {
		const employee = await User.findByIdAndDelete(req.params.id).select(
			"-password",
		);

		if (!employee) {
			return res
				.status(404)
				.json({ result: false, error: "Employé non trouvé" });
		}

		res.json({
			result: true,
			message: "Employé supprimé avec succès",
			employee,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ result: false, error: err.message });
	}
});

// UPDATE /employee/:id
router.put("/:id", async (req, res) => {
	try {
		const updatedEmployee = await User.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true },
		).select("-password");

		res.json({
			result: true,
			employee: updatedEmployee,
		});
	} catch (error) {
		res.status(500).json({
			result: false,
			error: error.message,
		});
	}
});

module.exports = router;