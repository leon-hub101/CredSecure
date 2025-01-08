const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("./models/User");
const OrganisationalUnit = require("./models/OrganisationalUnit");
const Division = require("./models/Division");
const Credential = require("./models/Credential");

dotenv.config();

const mongoURI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/credsecure";

async function seedDatabase() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clear existing data
    await User.deleteMany({});
    await OrganisationalUnit.deleteMany({});
    await Division.deleteMany({});
    await Credential.deleteMany({});

    // Create sample organisational units
    const newsOU = await OrganisationalUnit.create({ name: "News Management" });
    const softwareOU = await OrganisationalUnit.create({
      name: "Software Reviews",
    });

    // Create sample divisions
    const financeDivision = await Division.create({
      name: "Finance",
      organisationalUnit: newsOU._id,
    });
    const itDivision = await Division.create({
      name: "IT",
      organisationalUnit: softwareOU._id,
    });

    // Update OUs with divisions
    newsOU.divisions.push(financeDivision._id);
    softwareOU.divisions.push(itDivision._id);
    await newsOU.save();
    await softwareOU.save();

    // Create sample credentials
    await Credential.create({
      service: "WordPress News Site",
      username: "news_admin",
      password: "securepassword123",
      division: financeDivision._id,
    });

    // Create a sample user
    await User.create({
      username: "john_doe",
      password: "password",
      role: "Normal",
      divisions: [financeDivision._id],
    });

    console.log("Sample data seeded successfully");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding data:", error);
    mongoose.connection.close();
  }
}

seedDatabase();
