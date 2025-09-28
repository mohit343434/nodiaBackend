const Enquiry = require("../models/Enquiry");
const nodemailer = require("nodemailer");
const ExcelJS = require("exceljs");

// Add new enquiry
exports.createEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.create(req.body);
    res.json({ "status": true, "data": enquiry });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all enquiries
exports.getEnquiries = async (req, res) => {
  try {
    const { startDate, endDate, search, status } = req.query; // added status
    let filter = {};

    // 🔹 Date filter (createdAt)
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      filter.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.createdAt = { $lte: new Date(endDate) };
    }

    // 🔹 Search filter (name, email, phone, occasion, tripType)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { occasion: { $regex: search, $options: "i" } },
        { tripType: { $regex: search, $options: "i" } }
      ];
    }

    // 🔹 Status filter
    if (status) {
      filter.status = status; // exact match
    }

    const enquiries = await Enquiry.find(filter).sort({ createdAt: -1 });

    res.json({ status: true, data: enquiries });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// Update enquiry status/remark

exports.updateEnquiry = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    const enquiry = await Enquiry.findByIdAndUpdate(
      id, { status },
      { new: true, runValidators: true }
    );
    if (!enquiry) {
      return res.status(404).json({ error: "Enquiry not found" });
    }
    res.json({ status: true, data: enquiry });
  } catch (error) {
    res.status(400).json({ status: false, error: error.message });
  }
};


exports.deleteEnquiry = async (req, res) => {
  const { id } = req.params;
  try {
    const enquiry = await Enquiry.findByIdAndDelete({ _id: id });
    res.json({ "status": true, "data": enquiry });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Upload PDF & send email
exports.uploadItinerary = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  try {
    const enquiry = await Enquiry.findById(id);
    enquiry.itineraryFile = req.file.filename;
    enquiry.status = "Itinerary Sent";
    await enquiry.save();

    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "abigail59@ethereal.email",
        pass: "tdRhTvN8D14TBvv21y",
      },
    });

    await transporter.sendMail({
      from: `"Wellocia" <${process.env.EMAIL_USER}>`,
      to: enquiry.email,
      subject: "Your Itinerary",
      text: message,
      attachments: [{ filename: req.file.filename, path: `uploads/${req.file.filename}` }]
    });

    res.json({ "status": true, message: "Itinerary uploaded and email sent" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Export Enquiries to Excel
exports.exportEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Enquiries");

    sheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Trip Type", key: "tripType", width: 15 },
      { header: "Budget", key: "budget", width: 10 },
      { header: "Dates", key: "dates", width: 20 },
      { header: "Status", key: "status", width: 15 },
      { header: "Remarks", key: "remarks", width: 30 },
    ];

    enquiries.forEach((e) => sheet.addRow(e.toObject()));

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=enquiries.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
