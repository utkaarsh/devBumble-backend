const express = require("express");
const { createJobs, getRecentJobs, getRelevantJobs } = require("../controllers/jobController");
const router = express.Router();


router.post("/create-jobs", createJobs);
router.get("/recent-jobs", getRecentJobs);
router.get("/relevant-jobs", getRelevantJobs);

module.exports = router;