"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"
import { ProjectDetail } from "@/components/project-detail"
import { ConnectionTest } from "@/components/connection-test"

interface User {
  id: string
  email: string
  role: "Admin" | "Developer"
}

interface Project {
  _id: string
  name: string
  description: string
  creator: string
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState<"dashboard" | "project">("dashboard")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConnectionTest, setShowConnectionTest] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData: User) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    setCurrentView("dashboard")
    setSelectedProject(null)
  }

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project)
    setCurrentView("project")
  }

  const handleBackToDashboard = () => {
    setCurrentView("dashboard")
    setSelectedProject(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div>
        <LoginForm onLogin={handleLogin} />
        {/* Add connection test button */}
        <div className="text-center mt-4">
          <button
            onClick={() => setShowConnectionTest(!showConnectionTest)}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            {showConnectionTest ? "Hide" : "Show"} Connection Test
          </button>
        </div>
        {showConnectionTest && <ConnectionTest />}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Bug Logger</h1>
              {currentView === "project" && (
                <button onClick={handleBackToDashboard} className="ml-4 text-blue-600 hover:text-blue-800">
                  ← Back to Dashboard
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.email} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "dashboard" ? (
          <Dashboard user={user} onProjectSelect={handleProjectSelect} />
        ) : (
          selectedProject && <ProjectDetail project={selectedProject} user={user} />
        )}
      </main>
    </div>
  )
}
