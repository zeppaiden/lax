import { KokoroTTS } from "kokoro-js";

let ttsInstance: KokoroTTS | null = null;

export async function initTTS() {
  if (!ttsInstance) {
    ttsInstance = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-ONNX", {
      dtype: "q8",
    });
  }
  return ttsInstance;
}

export async function generateSpeech(text: string): Promise<ArrayBuffer> {
  const tts = await initTTS();
  const audio = await tts.generate(text, {
    voice: "af_bella",
  });
  return audio.arrayBuffer;
} 