"use server";

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { createDeck } from "./decks";
import { createCard } from "./cards";
import { auth } from "@clerk/nextjs/server";
// @ts-ignore
import pdf from "pdf-parse/lib/pdf-parse.js";

const flashcardsSchema = z.object({
  title: z.string().describe("The title of the deck generated from the content"),
  description: z.string().describe("A short description of what this deck covers"),
  summary: z.string().describe("A concise summary of the key points covered in the document (max 300 words)"),
  mindMap: z.object({
    nodes: z.array(z.object({
      id: z.string(),
      label: z.string(),
    })).describe("List of key concepts as nodes"),
    edges: z.array(z.object({
      source: z.string(),
      target: z.string(),
      label: z.string().optional(),
    })).describe("List of relationships between concepts"),
  }).describe("A hierarchical mind map structure of the concepts"),
  cards: z.array(
    z.object({
      front: z.string().describe("The question or concept on the front of the card"),
      back: z.string().describe("The answer or definition on the back of the card"),
    })
  ),
});

export async function generateDeckFromPDF(fileUrl: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    console.log("1. Fetching PDF from:", fileUrl);
    // 1. Fetch the PDF
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("PDF fetched, size:", buffer.length);

    // 2. Extract text
    console.log("2. Parsing PDF...");
    let textContent = "";
    try {
        const data = await pdf(buffer);
        textContent = data.text;
        console.log("PDF parsed, text length:", textContent.length);
    } catch (pdfError) {
        console.error("PDF Parsing failed:", pdfError);
        throw new Error("Failed to parse PDF content");
    }

    // Truncate if too long (Gemini 2.0 has huge context)
    // Increased limit to 300,000 characters to handle larger documents
    const truncatedText = textContent.slice(0, 300000);

    // 3. Generate Flashcards with Gemini
    console.log("3. Calling Gemini...");
    const { object } = await generateObject({
      model: google("gemini-2.0-flash"), // Using standard Gemini 2.0 Flash
      schema: flashcardsSchema,
      prompt: `
        You are an expert educational content creator. 
        Analyze the following text extracted from a PDF document.
        Create an EXHAUSTIVE and COMPREHENSIVE set of flashcards to help a student master EVERY detail of this document.
        
        CRITICAL INSTRUCTIONS:
        1. QUANTITY: Generate as many cards as possible. Aim for 50-100 cards for large documents. Do not summarize or skip details.
        2. COVERAGE: Cover every section, definition, formula, date, and key concept found in the text.
        3. GRANULARITY: Break down complex topics into multiple atomic flashcards.
        4. MIND MAP: Generate a detailed Mind Map structure (nodes and edges) to visualize the relationships between these concepts.
        5. LANGUAGE: The output (flashcards, summary, mind map labels) MUST be in the SAME LANGUAGE as the input text. If the text is in French, generate in French. If English, in English.
        
        - Keep the "front" concise (a question or term).
        - Keep the "back" clear and accurate.
        - Generate a suitable title, description, and summary.
        - For the Mind Map, identify the central topic (root node) and branch out to sub-topics.
        
        Text content:
        ${truncatedText}
      `,
    });
    console.log("Gemini response received:", object.title);

    // 4. Save to Database
    console.log("4. Saving to DB...");
    // We can't reuse createDeck directly because it redirects, so we'll do it manually or modify createDeck
    // Let's use the existing actions but handle the redirect differently or just use DB calls here for atomicity
    
    // Actually, let's just call the DB directly here to keep it self-contained and avoid redirect loops
    const { db } = await import("@/db");
    const { decks, cards, users } = await import("@/db/schema");
    const { currentUser } = await import("@clerk/nextjs/server");
    
    // Ensure user exists (just in case)
    const user = await currentUser();
    if (user && user.id) {
        await db.insert(users).values({
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress || "no-email",
            name: user.firstName ? `${user.firstName} ${user.lastName || ""}` : "User",
        }).onConflictDoNothing().execute();
    }

    const [newDeck] = await db.insert(decks).values({
      userId,
      title: object.title,
      description: object.description,
      summary: object.summary,
      mindMap: object.mindMap,
    }).returning();

    if (object.cards.length > 0) {
      await db.insert(cards).values(
        object.cards.map(card => ({
          deckId: newDeck.id,
          front: card.front,
          back: card.back,
        }))
      );
    }
    console.log("Deck saved with ID:", newDeck.id);

    return { deckId: newDeck.id };

  } catch (error) {
    console.error("Error generating deck:", error);
    // @ts-ignore
    throw new Error(`Failed to generate deck: ${error.message}`);
  }
}
