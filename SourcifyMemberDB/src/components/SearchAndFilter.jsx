"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaSearch, FaCopy, FaExternalLinkAlt, FaUsers } from "react-icons/fa"

const API_URL =
  "https://script.google.com/macros/s/AKfycbyZY7dr10olz4zseyWPOJZyCIdnhYI7djaK7srTWoq5qFybjWcjAMMaMew8VUHyxa2XSg/exec"

const roles = [
  "Tech team Coordinator",
  "PROutreach team Coordinator",
  "Creative-Content team Coordinator",
  "Design team Coordinator",
  "Editing team Coordinator",
  "Founder",
  "Co-founder",
  "Creative Content Lead",
  "PR & Outreach Lead",
  "Tech Lead",
  "PR & Outreach Co-lead",
  "Tech Co-lead",
]

const SearchAndFilter = () => {
  const [data, setData] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL)
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error("Error fetching data:", error)
        alert("Failed to fetch team data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredData = data.filter((person) => {
    return (
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedRole === "" || person.role === selectedRole)
    )
  })

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopySuccess(text)
    setTimeout(() => setCopySuccess(""), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6 w-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Sourcify Core Team DB</h1>
          <p className="text-gray-600">Search and explore our amazing team members</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Search and Filter</h2>
          <div className="space-y-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        <AnimatePresence>
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center h-64"
            >
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {filteredData.map((person) => (
                <div key={person.email} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold">{person.name}</h3>
                    <button onClick={() => copyToClipboard(person.name)} className="text-gray-500 hover:text-gray-700">
                      <FaCopy />
                    </button>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">{person.role}</span>
                    <button onClick={() => copyToClipboard(person.role)} className="text-gray-500 hover:text-gray-700">
                      <FaCopy />
                    </button>
                  </div>
                  <a
                    href={person.profilePhoto}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-500 hover:underline"
                  >
                    <FaExternalLinkAlt className="mr-1" />
                    View Profile Photo
                  </a>
                  {copySuccess === person.name || copySuccess === person.role ? (
                    <p className="text-green-500 text-sm mt-2">Copied!</p>
                  ) : null}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && filteredData.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-600">
            <FaUsers className="mx-auto text-5xl mb-4" />
            <p>No team members found. Try adjusting your search or filter.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default SearchAndFilter

