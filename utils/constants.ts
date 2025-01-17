export const OPENAI_TTS_VOICES = [
  { id: "alloy", name: "Alloy", description: "Neutral and balanced" },
  { id: "echo", name: "Echo", description: "Warm and rounded" },
  { id: "fable", name: "Fable", description: "British and proper" },
  { id: "onyx", name: "Onyx", description: "Deep and authoritative" },
  { id: "nova", name: "Nova", description: "Energetic and bright" },
  { id: "shimmer", name: "Shimmer", description: "Clear and melodic" },
] as const;

export type OpenAITTSVoice = typeof OPENAI_TTS_VOICES[number]["id"]; 