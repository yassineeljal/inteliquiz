"use server";

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const voiceValidationSchema = z.object({
  isCorrect: z.boolean().describe("Whether the spoken answer is conceptually correct"),
  score: z.number().min(0).max(100).describe("A score from 0 to 100 based on accuracy"),
  feedback: z.string().describe("Brief feedback explaining why it's correct or what was missing"),
});

export async function validateSpokenAnswer(spokenAnswer: string, correctAnswer: string, question: string, language: string = "en") {
  try {
    const { object } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: voiceValidationSchema,
      prompt: `
        You are an oral examiner.
        The exam is being conducted in ${language === 'fr' ? 'French' : 'English'}.
        
        Question: "${question}"
        Correct Answer (Definition): "${correctAnswer}"
        Student's Spoken Answer: "${spokenAnswer}"
        
        Evaluate the student's answer. 
        - It doesn't need to be word-for-word perfect.
        - It must capture the key concept.
        - If they are mostly right but missed a detail, give a high score but mention the missing detail in feedback.
        - If they are wrong, explain why.
        - PROVIDE THE FEEDBACK IN ${language === 'fr' ? 'FRENCH' : 'ENGLISH'}.
      `,
    });

    return object;
  } catch (error) {
    console.error("Voice validation error:", error);
    throw new Error("Failed to validate answer");
  }
}
