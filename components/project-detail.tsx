"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Bug } from "lucide-react"

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

interface Issue {
  _id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "open" | "closed"
  project: string
  createdAt: string
}

interface ProjectDetailProps {
  project: Project
  user: User
}

export function ProjectDetail({ project, user }: ProjectDetailProps) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null)
  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    status: "open" as const,
  })
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchIssues()
  }, [project._id])

  const fetchIssues = async () => {
    try {
      const token = localStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${API_URL}/api/issues/${project._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setIssues(data)
      } else {
        setError("Failed to fetch issues")
      }
    } catch (err) {
      setError("Network error. Please make sure the backend server is running.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${API_URL}/api/issues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newIssue, project: project._id }),
      })

      if (response.ok) {
        const issue = await response.json()
        setIssues([...issues, issue])
        setNewIssue({ title: "", description: "", priority: "medium", status: "open" })
        setIsCreateDialogOpen(false)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to create issue")
      }
    } catch (err) {
      setError("Network error. Please make sure the backend server is running.")
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingIssue) return

    setUpdating(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${API_URL}/api/issues/${editingIssue._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingIssue.title,
          description: editingIssue.description,
          priority: editingIssue.priority,
          status: editingIssue.status,
        }),
      })

      if (response.ok) {
        const updatedIssue = await response.json()
        setIssues(issues.map((issue) => (issue._id === updatedIssue._id ? updatedIssue : issue)))
        setIsEditDialogOpen(false)
        setEditingIssue(null)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to update issue")
      }
    } catch (err) {
      setError("Network error. Please make sure the backend server is running.")
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteIssue = async (issueId: string) => {
    if (!confirm("Are you sure you want to delete this issue?")) return

    try {
      const token = localStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${API_URL}/api/issues/${issueId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setIssues(issues.filter((issue) => issue._id !== issueId))
      } else {
        setError("Failed to delete issue")
      }
    } catch (err) {
      setError("Network error. Please make sure the backend server is running.")
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    return status === "open" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{project.name}</h2>
          <p className="text-gray-600 mt-2">{project.description}</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Issue
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Issue</DialogTitle>
              <DialogDescription>Report a new bug or issue for this project.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateIssue}>
              <div className="space-y-4 py-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newIssue.title}
                    onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                    required
                    placeholder="Enter issue title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newIssue.description}
                    onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                    required
                    placeholder="Describe the issue in detail"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newIssue.priority}
                      onValueChange={(value: any) => setNewIssue({ ...newIssue, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newIssue.status}
                      onValueChange={(value: any) => setNewIssue({ ...newIssue, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create Issue"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {issues.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Bug className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No issues yet</h3>
            <p className="text-gray-600 mb-4">Start tracking bugs and issues for this project.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Issue
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Issues ({issues.length})</CardTitle>
            <CardDescription>Track and manage project issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issues.map((issue) => (
                    <TableRow key={issue._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{issue.title}</div>
                          <div className="text-sm text-gray-600 truncate max-w-xs">{issue.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(issue.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingIssue(issue)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteIssue(issue._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Issue Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Issue</DialogTitle>
            <DialogDescription>Update the issue details.</DialogDescription>
          </DialogHeader>
          {editingIssue && (
            <form onSubmit={handleUpdateIssue}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingIssue.title}
                    onChange={(e) => setEditingIssue({ ...editingIssue, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingIssue.description}
                    onChange={(e) => setEditingIssue({ ...editingIssue, description: e.target.value })}
                    required
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select
                      value={editingIssue.priority}
                      onValueChange={(value: any) => setEditingIssue({ ...editingIssue, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={editingIssue.status}
                      onValueChange={(value: any) => setEditingIssue({ ...editingIssue, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updating}>
                  {updating ? "Updating..." : "Update Issue"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
