// Database Setup Script
const mongoose = require("mongoose")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/buglogger"

async function setupDatabase() {
  try {
    console.log("Connecting to MongoDB...")
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log("Connected to MongoDB successfully!")
    console.log("Database URL:", MONGODB_URI)
    console.log("Database Name: buglogger")

    // Test the connection
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log(
      "Available collections:",
      collections.map((c) => c.name),
    )

    console.log("\nDatabase setup complete!")
    console.log("You can now start the server with: node server.js")
  } catch (error) {
    console.error("Database setup failed:", error.message)
    console.log("\nTroubleshooting:")
    console.log("1. Make sure MongoDB is installed and running")
    console.log("2. Check if MongoDB service is started")
    console.log("3. Verify the connection string is correct")
  } finally {
    await mongoose.connection.close()
  }
}

setupDatabase()
