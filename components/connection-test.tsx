"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ConnectionTest() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<string>("")
  const [error, setError] = useState<string>("")

  const testConnection = async () => {
    setTesting(true)
    setResult("")
    setError("")

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      console.log("Testing connection to:", API_URL)

      const response = await fetch(`${API_URL}/api/test`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setResult(`✅ Connection successful! Backend responded: ${data.message}`)
      } else {
        setError(`❌ Backend responded with status: ${response.status}`)
      }
    } catch (err: any) {
      setError(`❌ Connection failed: ${err.message}`)
      console.error("Connection test failed:", err)
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Backend Connection Test</CardTitle>
        <CardDescription>Test if frontend can connect to backend</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p>
            <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}
          </p>
        </div>

        <Button onClick={testConnection} disabled={testing} className="w-full">
          {testing ? "Testing..." : "Test Connection"}
        </Button>

        {result && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{result}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
