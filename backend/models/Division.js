const mongoose = require("mongoose");

const DivisionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  credentials: [{ type: mongoose.Schema.Types.ObjectId, ref: "Credential" }],
  organisationalUnit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OrganisationalUnit",
  },
});

module.exports = mongoose.model("Division", DivisionSchema);
