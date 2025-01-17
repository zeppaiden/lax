import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/utils/supabase/server";
import { OPENAI_TTS_VOICES } from "@/utils/constants";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text, message_creator_id } = await request.json();

    if (!text || !message_creator_id) {
      return NextResponse.json(
        { error: "Text and message_creator_id are required" },
        { status: 400 }
      );
    }

    // Get message creator's preferred voice from their account settings
    const supabase = await createClient();
    const { data: account } = await supabase
      .from("accounts")
      .select("meta")
      .eq("account_id", message_creator_id)
      .single();

    // Use the message creator's preferred voice or fall back to "alloy"
    const voice = (account?.meta?.tts_voice || "alloy") as typeof OPENAI_TTS_VOICES[number]["id"];

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice,
      input: text,
    });

    // Convert the response to ArrayBuffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Return audio as streaming response
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
} 