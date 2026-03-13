const express = require("express");
const router = express.Router();

const {
getUnsafeZones,
createUnsafeZone,
deleteUnsafeZone,
} = require("../controllers/unsafeZoneController");

const adminAuth = require("../middleware/adminAuth");

router.get("/", getUnsafeZones);

router.post("/", adminAuth, createUnsafeZone);

router.delete("/:id", adminAuth, deleteUnsafeZone);

module.exports = router;