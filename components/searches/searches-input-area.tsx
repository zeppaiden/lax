"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchesInputAreaProps {
  onSearch: (query: string) => Promise<void>;
  disabled?: boolean;
}

export function SearchesInputArea({ onSearch, disabled }: SearchesInputAreaProps) {
  const [query, setQuery] = React.useState("")

  const handleSubmit = () => {
    if (query.trim()) {
      onSearch(query.trim())
      setQuery("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex items-center gap-2 p-4 border-t">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search messages..."
        className="flex-1 font-sans text-sm"
      />
      <Button 
        onClick={handleSubmit}
        className="font-sans"
        disabled={disabled}
      >
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>
    </div>
  )
}
