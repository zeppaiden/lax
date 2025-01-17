"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { 
  Drawer, 
  DrawerContent, 
  DrawerDescription, 
  DrawerHeader,
  DrawerTitle 
} from "@/components/ui/drawer"
import { useServiceContext } from "@/contexts/page"
import { toast } from "sonner"
import { SearchesInputArea } from "@/components/searches/searches-input-area"
import { SearchMessage } from "@/services"
import { SearchesMessagesList } from "@/components/searches/searches-messages-list"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function SearchesOpenDrawer() {
  const [open, setOpen] = React.useState(false)
  const [results, setResults] = React.useState<SearchMessage[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [aiSummaryEnabled, setAiSummaryEnabled] = React.useState(false)
  const [summary, setSummary] = React.useState<string>("")

  const { service_manager, current_account, current_network } = useServiceContext()

  const handleSearch = async (query: string) => {
    setIsLoading(true)
    setSummary("")
    const toast_id = toast.loading("Searching...")

    try {
      const result = await service_manager.messages.searchMessages(
        current_network?.network_id || "",
        current_account.account_id || "",
        query
      )

      if (!result.success) {
        toast.error(result.failure?.message || "An error occurred", {
          id: toast_id,
          description: result.failure?.context || "Unknown error"
        })
        return
      }

      const searchResults = result.content?.map((item: any) => item.result) || []
      setResults(searchResults)

      if (aiSummaryEnabled && searchResults.length > 0) {
        // Request AI summary
        const summaryResult = await service_manager.messages.summarizeSearchResults(
          searchResults.map(r => r.message.content).join("\n")
        )
        
        if (summaryResult.success) {
          setSummary(summaryResult.content || '');
        } else {
          toast.error("Failed to generate summary", {
            description: summaryResult.failure?.message
          })
        }
      }

      toast.success("Search completed", {
        id: toast_id,
        description: `Found ${searchResults.length} messages`
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
        <Search className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Open search</span>
      </Button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="h-[75vh] w-[65%] mx-auto overflow-hidden">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-bold font-sans text-center">Search</DrawerTitle>
            <DrawerDescription className="text-xs text-muted-foreground text-center">
              Results include messages from all <strong>channels</strong>, <strong>whispers</strong>, and <strong>spinoffs</strong> within the current network that <strong>you</strong> have permission to view
            </DrawerDescription>
            <div className="flex items-center justify-center space-x-2 mt-4">
              <Switch
                id="ai-summary"
                checked={aiSummaryEnabled}
                onCheckedChange={setAiSummaryEnabled}
              />
              <Label htmlFor="ai-summary" className="text-sm">AI Summary</Label>
            </div>
          </DrawerHeader>

          {summary && (
            <div className="px-4 py-2 mb-4 bg-muted/50 rounded-lg mx-4">
              <h3 className="text-sm font-medium mb-1">AI Summary</h3>
              <p className="text-sm text-muted-foreground">{summary}</p>
            </div>
          )}

          <SearchesMessagesList results={results} />

          <div className="mt-auto">
            <SearchesInputArea onSearch={handleSearch} disabled={isLoading} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
