// Bug Logger Backend Server
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/buglogger"

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
)
app.use(express.json())

// MongoDB Connection
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// User Schema
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Admin", "Developer"], default: "Developer" },
  },
  { timestamps: true },
)

const User = mongoose.model("User", userSchema)

// Project Schema
const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
)

const Project = mongoose.model("Project", projectSchema)

// Issue Schema
const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  },
  { timestamps: true },
)

const Issue = mongoose.model("Issue", issueSchema)

// Auth Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Access token required" })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.userId)
    if (!user) {
      return res.status(401).json({ message: "Invalid token" })
    }
    req.user = user
    next()
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" })
  }
}

// Admin Middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Admin access required" })
  }
  next()
}

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user (first user is Admin, rest are Developers)
    const userCount = await User.countDocuments()
    const role = userCount === 0 ? "Admin" : "Developer"

    const user = new User({
      email,
      password: hashedPassword,
      role,
    })

    await user.save()

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "24h" })

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "24h" })

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Project Routes
app.get("/api/projects", authenticateToken, async (req, res) => {
  try {
    const projects = await Project.find().populate("creator", "email")
    res.json(projects)
  } catch (error) {
    console.error("Get projects error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.post("/api/projects", authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body

    const project = new Project({
      name,
      description,
      creator: req.user._id,
    })

    await project.save()
    await project.populate("creator", "email")

    res.status(201).json(project)
  } catch (error) {
    console.error("Create project error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// NEW: Delete Project Route (Admin only)
app.delete("/api/projects/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    // Check if project exists
    const project = await Project.findById(id)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    // Delete all issues associated with this project first
    await Issue.deleteMany({ project: id })

    // Delete the project
    await Project.findByIdAndDelete(id)

    res.json({
      message: "Project and all associated issues deleted successfully",
      deletedProject: project.name,
    })
  } catch (error) {
    console.error("Delete project error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Issue Routes
app.get("/api/issues/:projectId", authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params
    const issues = await Issue.find({ project: projectId }).populate("project", "name")
    res.json(issues)
  } catch (error) {
    console.error("Get issues error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.post("/api/issues", authenticateToken, async (req, res) => {
  try {
    const { title, description, priority, status, project } = req.body

    const issue = new Issue({
      title,
      description,
      priority,
      status,
      project,
    })

    await issue.save()
    await issue.populate("project", "name")

    res.status(201).json(issue)
  } catch (error) {
    console.error("Create issue error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.put("/api/issues/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, priority, status } = req.body

    const issue = await Issue.findByIdAndUpdate(id, { title, description, priority, status }, { new: true }).populate(
      "project",
      "name",
    )

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" })
    }

    res.json(issue)
  } catch (error) {
    console.error("Update issue error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.delete("/api/issues/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const issue = await Issue.findByIdAndDelete(id)
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" })
    }

    res.json({ message: "Issue deleted successfully" })
  } catch (error) {
    console.error("Delete issue error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log("Bug Logger API is ready!")
  console.log("\nAvailable endpoints:")
  console.log("POST /api/auth/register - Register new user")
  console.log("POST /api/auth/login - Login user")
  console.log("GET /api/projects - Get all projects")
  console.log("POST /api/projects - Create new project")
  console.log("DELETE /api/projects/:id - Delete project (Admin only)")
  console.log("GET /api/issues/:projectId - Get issues for project")
  console.log("POST /api/issues - Create new issue")
  console.log("PUT /api/issues/:id - Update issue")
  console.log("DELETE /api/issues/:id - Delete issue")
})
