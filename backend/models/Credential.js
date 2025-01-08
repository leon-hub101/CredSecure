const mongoose = require("mongoose");

const CredentialSchema = new mongoose.Schema({
  service: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  division: { type: mongoose.Schema.Types.ObjectId, ref: "Division" },
});

module.exports = mongoose.model("Credential", CredentialSchema);
