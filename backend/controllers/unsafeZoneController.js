const UnsafeZone = require("../models/UnsafeZone");

const ALLOWED_LEVELS = ["High Risk", "Medium Risk", "Low Lighting"];

const getUnsafeZones = async (req, res) => {
try {

const zones = await UnsafeZone.find().sort({ createdAt: -1 });

res.status(200).json(zones);

} catch (error) {

res.status(500).json({ message: "Failed to fetch unsafe zones" });

}
};

const createUnsafeZone = async (req, res) => {

try {

const { title, level, latitude, longitude, radius, description, source } = req.body;

if (!title?.trim()) {
return res.status(400).json({ message: "Title is required" });
}

if (!ALLOWED_LEVELS.includes(level)) {
return res.status(400).json({ message: "Invalid risk level" });
}

const lat = Number(latitude);
const lng = Number(longitude);
const zoneRadius = Number(radius ?? 500);

if (Number.isNaN(lat) || lat < -90 || lat > 90) {
return res.status(400).json({ message: "Invalid latitude" });
}

if (Number.isNaN(lng) || lng < -180 || lng > 180) {
return res.status(400).json({ message: "Invalid longitude" });
}

if (Number.isNaN(zoneRadius) || zoneRadius < 50 || zoneRadius > 5000) {
return res.status(400).json({ message: "Radius must be between 50 and 5000 meters" });
}

const newZone = new UnsafeZone({
title: title.trim(),
level,
latitude: lat,
longitude: lng,
radius: zoneRadius,
description: description?.trim() || "",
source: source || "community",
});

const savedZone = await newZone.save();

res.status(201).json(savedZone);

} catch (error) {

res.status(500).json({ message: "Failed to create unsafe zone" });

}
};

const deleteUnsafeZone = async (req, res) => {

try {

const zone = await UnsafeZone.findByIdAndDelete(req.params.id);

if (!zone) {
return res.status(404).json({ message: "Unsafe zone not found" });
}

res.status(200).json({ message: "Unsafe zone deleted successfully" });

} catch (error) {

res.status(500).json({ message: "Failed to delete unsafe zone" });

}
};

module.exports = {
getUnsafeZones,
createUnsafeZone,
deleteUnsafeZone,
};