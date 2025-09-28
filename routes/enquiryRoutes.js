const express = require("express");
const { createEnquiry, getEnquiries, updateEnquiry, uploadItinerary, exportEnquiries, deleteEnquiry } = require("../controllers/enquiryController");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");

const router = express.Router();

// File upload setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.post("/", createEnquiry); // public form
router.get("/",  getEnquiries);
router.put("/:id",  updateEnquiry);
router.delete("/:id",  deleteEnquiry);
router.post("/:id/itinerary",  upload.single("file"), uploadItinerary);
router.get("/export/excel",  exportEnquiries);

module.exports = router;
