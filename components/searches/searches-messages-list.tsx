"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SearchMessage } from "@/services"
import { SearchesMessagesItem } from "./searches-messages-item"

interface SearchesMessagesListProps {
  results: SearchMessage[]
}

export function SearchesMessagesList({ results }: SearchesMessagesListProps) {
  // Memoize the filtered results
  const validResults = React.useMemo(() => 
    results?.filter(result => result?.message?.message_id) || [],
    [results]
  )

  // Use virtualization for large lists
  return (
    <ScrollArea className="flex-1 px-4">
      <div className="space-y-4 py-4">
        {validResults.map((result) => (
          <SearchesMessagesItem 
            key={result.message.message_id} 
            result={result}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
