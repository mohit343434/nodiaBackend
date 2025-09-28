const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  tripType: String,
  budget: String,
  dates: String,
  occasion: String,
  status: {
    type: String,
    enum: ["New", "Contacted", "Itinerary Sent", "Confirmed", "Waitlist"],
    default: "New"
  },
  itineraryFile: String
}, {
  timestamps: true
});

module.exports = mongoose.model("Enquiry", enquirySchema);
