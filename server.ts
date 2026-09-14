import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy Google GenAI initialization
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", aiAvailable: Boolean(process.env.GEMINI_API_KEY) });
});

// AI Chatbot Study Buddy endpoint
app.post("/api/chat", async (req, res) => {
  const { message, history = [], mode = "general", subject = "General Studies" } = req.body;

  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  const ai = getGenAI();

  // Mode-specific persona instructions
  let modeGuidance = "";
  if (mode === "explain") {
    modeGuidance = "The student wants a simple, crystal-clear explanation. Use intuitive analogies, bullet points, and highlight key terms.";
  } else if (mode === "quiz") {
    modeGuidance = "Quiz the student! Provide a short, fun 2-3 question quiz with multiple choices or prompt them to test their memory, then encourage them.";
  } else if (mode === "pomodoro") {
    modeGuidance = "Act as an encouraging, gentle Pomodoro study coach. Help them set a 25-minute goal, stay focused, and celebrate micro-wins.";
  } else if (mode === "flashcards") {
    modeGuidance = "Format your response as cute, high-yield flashcard Q&As or term definitions they can write into their study cards.";
  } else {
    modeGuidance = "Provide helpful, friendly, motivating academic guidance and answers with warm positivity and clear structuring.";
  }

  const systemInstruction = `You are "Berry" (or "Bunny"), an adorable, aesthetic, and exceptionally smart study buddy and academic mentor.
Subject context: ${subject}.
Mode: ${mode}.
${modeGuidance}
Tone: Warm, supportive, encouraging, organized, aesthetic (with occasional cute study emojis like 🍓, 📖, ✨, ☕, 🌸, 📝).
Keep your formatting clean and readable using markdown bolding and bullet lists.`;

  if (!ai) {
    // Elegant fallback response when API key is missing
    const fallbackReplies: Record<string, string> = {
      explain: `✨ **Here is a quick breakdown of "${message}"!**\n\n1. **Core Concept**: Break it down into the main idea first.\n2. **Why it matters**: Understanding the real-world application cements memory.\n3. **Quick tip**: Try teaching this back in your own words (the Feynman technique)!\n\n*(Connect your Gemini API Key in Settings > Secrets for real-time live answers!)* 🍓`,
      quiz: `🌸 **Quiz Time! Let's test your knowledge on ${subject}:**\n\n**Question**: How would you summarize the core rule of "${message}" in one sentence?\n\n*A)* It's the primary cause.\n*B)* It functions as a supporting variable.\n*C)* It's an exception to the rule.\n\nTake your best guess and let me know! 📝✨`,
      pomodoro: `☕ **Study Sprint Activated!**\n\nLet's do 25 minutes of deep focus on: *${message}*.\n- Close distracting browser tabs.\n- Grab your favorite warm drink.\n- Set your timer and go! You've got this! 🌟`,
      flashcards: `📝 **Flashcard Idea for "${message}":**\n\n**Front**: Key Concept of ${message}\n**Back**: The essential formula / definition to remember for exams.\n\nAdd this to your Study Material deck! 🎀`,
      general: `🍓 **Hi study friend!** I'm Berry, your aesthetic study buddy!\n\nRegarding *"${message}"*: Remember to take it one step at a time, break large concepts into cute bite-sized pieces, and review your notes consistently! Let me know if you want me to quiz you or explain anything in detail. ✨`
    };

    res.json({
      reply: fallbackReplies[mode] || fallbackReplies.general,
      modelUsed: "local-study-buddy"
    });
    return;
  }

  try {
    // Format conversation history for Gemini
    const contents: any[] = [];

    // Add prior history if provided
    if (Array.isArray(history)) {
      for (const turn of history.slice(-6)) {
        if (turn.role && turn.text) {
          contents.push({
            role: turn.role === "assistant" ? "model" : "user",
            parts: [{ text: turn.text }]
          });
        }
      }
    }

    // Add current user prompt
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text || "I'm cheering you on! Let's conquer this study session together. ✨";
    res.json({ reply, modelUsed: "gemini-3.8-flash" });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({
      error: "Could not complete AI request",
      details: error?.message || "Unknown error"
    });
  }
});

// Notion integration proxy endpoints
app.get("/api/notion/status", (_req, res) => {
  res.json({
    configured: Boolean(process.env.NOTION_API_KEY),
  });
});

app.post("/api/notion/search", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "") || process.env.NOTION_API_KEY;
  if (!token) {
    res.status(401).json({ error: "No Notion API token provided." });
    return;
  }

  const { query = "", filter } = req.body;
  try {
    const notionRes = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        ...(filter ? { filter } : {}),
        page_size: 25,
      }),
    });

    const data = await notionRes.json();
    if (!notionRes.ok) {
      res.status(notionRes.status).json({ error: data.message || "Notion API error" });
      return;
    }
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to reach Notion" });
  }
});

app.post("/api/notion/pages", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "") || process.env.NOTION_API_KEY;
  if (!token) {
    res.status(401).json({ error: "No Notion API token provided." });
    return;
  }

  const { parentId, title, content } = req.body;
  try {
    const notionRes = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: parentId ? { page_id: parentId } : undefined,
        properties: {
          title: {
            title: [
              {
                text: {
                  content: title || "Untitled Campus Note",
                },
              },
            ],
          },
        },
        children: content
          ? [
              {
                object: "block",
                type: "paragraph",
                paragraph: {
                  rich_text: [
                    {
                      type: "text",
                      text: {
                        content,
                      },
                    },
                  ],
                },
              },
            ]
          : [],
      }),
    });

    const data = await notionRes.json();
    if (!notionRes.ok) {
      res.status(notionRes.status).json({ error: data.message || "Failed to create page in Notion" });
      return;
    }
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to create Notion page" });
  }
});

// WhatsApp AI Summarization Endpoint
app.post("/api/whatsapp/summarize", async (req, res) => {
  const { chatName, messages = [] } = req.body;

  if (!messages || messages.length === 0) {
    res.status(400).json({ error: "No messages provided to summarize" });
    return;
  }

  const ai = getGenAI();
  if (!ai) {
    // Graceful fallback summary if Gemini API key is not configured
    let overview = `Summary of ${messages.length} messages in "${chatName}". Key course updates, deadlines, and laboratory session schedules reviewed.`;
    let urgentAlerts = [
      "Check group announcements regarding tomorrow's deadline",
      "Confirm your attendance for the scheduled room"
    ];
    let actionItems = [
      "Review shared notes and syllabus guidelines",
      "Confirm session time with peers"
    ];
    let deadlines = [
      "Upcoming assignment submission this week"
    ];

    if (chatName.includes("BioChem") || chatName.includes("CHEM-204")) {
      overview = `Professor Vance announced Lab #3 safety requirements and rescheduled the Section B Makeup Lab to Wednesday 3:00 PM - 4:30 PM in Sci-Lab 201.`;
      urgentAlerts = [
        "🚨 URGENT: CHEM-204 Makeup Lab rescheduled to Wednesday 3:00 PM - 4:30 PM!",
        "Safety contracts must be signed before Thursday 8:00 AM sharp to enter the lab"
      ];
      actionItems = [
        "Print & sign pre-lab safety contract",
        "Review Table 2 TLC spectrophotometry calculations in shared doc",
        "Submit Lab Report Draft on GradeScope by Friday Sep 18"
      ];
      deadlines = [
        "Wednesday 3:00 PM - 4:30 PM (CHEM-204 Makeup Lab)",
        "Thursday 8:00 AM (Safety Contract)",
        "Friday Sep 18 at 11:59 PM (Lab Report Draft)"
      ];
    } else if (chatName.includes("History") || chatName.includes("HIST-110")) {
      overview = `Study Circle confirmed the mandatory midterm review session for Wednesday 3:00 PM - 5:30 PM in Library Room 3B.`;
      urgentAlerts = [
        "⏰ Mandatory Review Meeting: Wednesday 3:00 PM - 5:30 PM in Library Room 3B",
        "Focus heavily on Chapter 4 trade routes & Silk Road timelines for the essay"
      ];
      actionItems = [
        "Bring primary source analysis sheets to Library Room 3B",
        "Review Chapter 4 Silk Road timeline and trade routes"
      ];
      deadlines = [
        "Wednesday 3:00 PM - 5:30 PM (World History Review Session)",
        "Midterm Exam next week"
      ];
    }

    res.json({
      overview,
      urgentAlerts,
      actionItems,
      deadlines,
      generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    return;
  }

  try {
    const formattedTranscript = messages
      .map((m: any) => `[${m.timestamp}] ${m.senderName}: ${m.text}`)
      .join("\n");

    const prompt = `You are a helpful college campus academic assistant.
Analyze this WhatsApp chat transcript from "${chatName}" and identify all important information for a student, paying special attention to class schedules, lecture times, labs, and any possible timing conflicts.

TRANSCRIPT:
${formattedTranscript}

Provide a structured JSON output with:
1. "overview": A concise 2-sentence summary of the main discussion.
2. "urgentAlerts": Array of high-priority urgent announcements, professor messages, rescheduled classes, or schedule shifts (max 3).
3. "actionItems": Array of concrete tasks, homework, things students need to submit or do (max 4).
4. "deadlines": Array of specific dates/times mentioned for exams, lab reports, assignments, or class sessions (max 4).

Respond strictly with valid JSON conforming to:
{
  "overview": "...",
  "urgentAlerts": ["..."],
  "actionItems": ["..."],
  "deadlines": ["..."]
}`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
    } catch (primaryErr: any) {
      console.warn("Primary model gemini-3.8-flash failed, attempting gemini-3.6-flash fallback:", primaryErr?.message);
      response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
    }

    const outputText = response.text || "{}";
    const parsed = JSON.parse(outputText);

    res.json({
      overview: parsed.overview || `Summary of key updates in ${chatName}.`,
      urgentAlerts: parsed.urgentAlerts || [],
      actionItems: parsed.actionItems || [],
      deadlines: parsed.deadlines || [],
      generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  } catch (error: any) {
    console.error("Gemini WhatsApp summary error:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate summary",
      overview: `Summary of ${messages.length} messages in ${chatName}.`,
      urgentAlerts: ["Exam review room updated", "Lab assignment due soon"],
      actionItems: ["Bring printed safety contract", "Finish mechanism problems"],
      deadlines: ["Thursday 11:59 PM"],
      generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
