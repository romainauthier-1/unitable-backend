var express = require("express");
var router = express.Router();
const Service = require("../models/services");
const { checkBody } = require("../modules/checkBody");

// GET Tous les services d'un restaurant
router.get("/:id", async (req, res) => {
  try {
    const services = await Service.find({ restaurant: req.params.id });

    if (!services || services.length === 0) {
      return res.json({ result: false, message: "Aucun service trouvé" });
    }

    res.json({ result: true, services });
  } catch (err) {
    res.json({ result: false, message: err.message });
  }
});
// Recuperer les teams d'un service d'un restaurant par l'organizationId

router.get("/teams/:id", async (req, res) => {
  try {
    const service = await Service.find({ restaurant: req.params.id });
    if (!service || service.length === 0) {
      return res.json({ result: false, message: "Services non trouvé" });
    }
    res.json({ result: true, teams: service.teams });
  } catch (err) {
    res.json({ result: false, message: err.message });
  }
});
// POST Ajouter un service à un restaurant
router.post("/", async (req, res) => {
  try {
    if (!checkBody(req.body, ["name", "startTime", "endTime", "dayOfWeek"])) {
      return res.json({ result: false, message: "Champs manquants" });
    }

    const { name, startTime, endTime, dayOfWeek, restaurant, teams } = req.body;

    const newService = new Service({
      name,
      startTime,
      endTime,
      dayOfWeek,
      restaurant,
      teams,
    });

    await newService.save();
    res.json({
      result: true,
      message:
        "Service ajouté avec succès, vous allez être redirigé.e vers l'étape suivante !",
      serviceId: newService._id,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ result: false, message: err.message });
  }
});

// DELETE Supprimer un service d'un restaurant
router.delete("/:id", async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.json({ result: false, message: "Service non trouvé" });
    }

    res.json({ result: true, message: "Service supprimé avec succès" });
  } catch (err) {
    res.json({ result: false, message: err.message });
  }
});

router.delete("/:id/teams/:teamName", async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { $pull: { teams: { teamName: decodeURIComponent(req.params.teamName) } } },
      { new: true },
    );
    if (!service) {
      return res.json({ result: false, message: "Service non trouvé" });
    }

    res.json({ result: true, message: "Equipe supprimée avec succès" });
  } catch (err) {
    res.json({ result: false, message: err.message });
  }
});

// PUT Modifier un service d'un restaurant
router.put("/:id", async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!service) {
      return res.json({ result: false, message: "Service non trouvé" });
    }

    res.json({ result: true, message: "Service modifié avec succès", service });
  } catch (err) {
    res.json({ result: false, message: err.message });
  }
});

module.exports = router;
