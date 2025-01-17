const handleSubmit = async () => {
  if (!content.trim()) return
  const toastId = toast.loading('Sending message...')
  setIsSubmitting(true)

  try {
    const { data: result, error } = await supabase.rpc('fn_create_message', {
      p_channel_id: channel_id,
      p_account_id: session?.user.id,
      p_content: content.trim(),
      p_meta: {}
    })

    if (error) {
      throw error
    }

    // Only send to bot if message starts with /ask
    if (content.trim().toLowerCase().startsWith('/ask')) {
      // Fire off Pinecone API call without waiting or checking result
      fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          channel_id, 
          content: content.trim(),
          message_id: result.message_id,
          input_history: [] // Add empty input history if none exists
        })
      })
    }

    setContent('')
    setIsSubmitting(false)
    toast.success('Message sent', { id: toastId })
  } catch (error) {
    setIsSubmitting(false)
    setTimeout(() => {
      toast.error('Failed to send message', {
        id: toastId,
        description: error instanceof Error ? error.message : undefined
      })
    }, 0)
    console.error('Submit error:', error)
  }
} 