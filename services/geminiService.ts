import { GoogleGenAI, Type } from "@google/genai";
import { DamageReport } from "../types";

// Safe initialization of API key
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    const key = process.env.API_KEY;
    if (!key || key.includes("YOUR_API_KEY") || key.includes("INSERT_KEY") || key.trim() === "") {
        return '';
    }
    return key;
  }
  return '';
};

const apiKey = getApiKey();
// Initialize with dummy key if missing to prevent constructor error.
const ai = new GoogleGenAI({ apiKey: apiKey || 'demo-mode-dummy-key' });

const DAMAGE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    damages: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { 
            type: Type.STRING,
            description: "Type of damage (e.g., Scratch, Dent, Rust, Crack, Broken Glass, Bumper Damage)" 
          },
          severity: { 
            type: Type.STRING,
            enum: ["Minor", "Moderate", "Severe"],
            description: "Estimated severity of the damage"
          },
          confidence: { 
            type: Type.NUMBER,
            description: "Confidence score between 0.0 and 1.0"
          },
          description: {
            type: Type.STRING,
            description: "Brief description of the specific damage instance"
          },
          box_2d: {
            type: Type.ARRAY,
            items: { type: Type.INTEGER },
            description: "Bounding box coordinates [ymin, xmin, ymax, xmax] normalized to a 1000x1000 grid."
          }
        },
        required: ["label", "severity", "confidence", "box_2d", "description"]
      }
    },
    summary: { 
      type: Type.STRING,
      description: "A professional summary of the vehicle's condition."
    },
    vehicle_parts_visible: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of vehicle parts visible in the image (e.g., hood, door, bumper)"
    },
    total_severity_score: {
      type: Type.INTEGER,
      description: "An overall score from 0 (perfect) to 100 (totaled) representing the vehicle's damage level."
    }
  },
  required: ["damages", "summary", "vehicle_parts_visible", "total_severity_score"]
};

// --- MOCK SCENARIOS FOR LOCAL/DEMO MODE ---
const SCENARIOS = [
  {
    id: "scenario-minor",
    summary: "DEMO: Vehicle shows signs of minor cosmetic wear. A few surface scratches detected on the front bumper and fender.",
    vehicle_parts_visible: ["Front Bumper", "Left Fender", "Headlights"],
    total_severity_score: 15,
    damages: [
      {
        label: "Scratch",
        severity: "Minor",
        confidence: 0.94,
        description: "Deep clear coat scratch detected on the front left fender.",
        box_2d: [300, 200, 450, 400] 
      },
      {
        label: "Paint Chip",
        severity: "Minor",
        confidence: 0.88,
        description: "Small paint chip on the bumper.",
        box_2d: [600, 300, 650, 350]
      }
    ]
  },
  {
    id: "scenario-moderate",
    summary: "DEMO: Moderate damage detected. Impact dent visible on the hood panel with associated paint damage.",
    vehicle_parts_visible: ["Hood", "Windshield", "Front Grille"],
    total_severity_score: 45,
    damages: [
      {
        label: "Dent",
        severity: "Moderate",
        confidence: 0.92,
        description: "Impact dent visible on the hood panel near the center line.",
        box_2d: [400, 400, 600, 600]
      },
       {
        label: "Crack",
        severity: "Minor",
        confidence: 0.85,
        description: "Hairline crack on front grille plastic.",
        box_2d: [650, 400, 750, 600]
      }
    ]
  },
  {
    id: "scenario-severe",
    summary: "DEMO: CRITICAL DAMAGE. Front collision impact visible with structural bumper damage and potential frame misalignment.",
    vehicle_parts_visible: ["Front Bumper", "Hood", "Headlights"],
    total_severity_score: 85,
    damages: [
      {
        label: "Bumper Damage",
        severity: "Severe",
        confidence: 0.98,
        description: "Major structural damage and detachment of front bumper.",
        box_2d: [600, 100, 900, 900]
      },
      {
        label: "Broken Glass",
        severity: "Moderate",
        confidence: 0.95,
        description: "Shattered headlight casing on right side.",
        box_2d: [500, 700, 600, 850]
      }
    ]
  },
  {
    id: "scenario-clean",
    summary: "DEMO: Vehicle appears to be in excellent condition. No significant damages detected by the system.",
    vehicle_parts_visible: ["Side Profile", "Doors", "Windows"],
    total_severity_score: 0,
    damages: []
  }
];

// Helper to generate fresh mock data
const generateMockResponse = (summaryOverride?: string): DamageReport => {
    // Pick a random scenario to make testing interesting
    const randomScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    const timestamp = Date.now();
    
    // Deep clone
    const demoData = JSON.parse(JSON.stringify(randomScenario));
    
    demoData.id = `demo-${randomScenario.id}-${timestamp}`;
    demoData.date = new Date().toISOString();
    
    if (summaryOverride) {
      demoData.summary = summaryOverride;
    }

    // Ensure damages have unique IDs for React
    demoData.damages = demoData.damages.map((d: any, i: number) => ({
      ...d,
      id: `demo-dmg-${i}-${timestamp}`
    }));
    
    return demoData;
};

export const analyzeVehicleImage = async (base64Image: string): Promise<DamageReport> => {
  // 1. Explicit Demo Mode check (No Key configured or Placeholder detected)
  if (!apiKey) {
    console.warn("AutoSpector: No valid API Key found. Running in Demo Mode.");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing delay
    return generateMockResponse();
  }

  try {
    // Real API Call
    const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an expert car insurance appraiser. Analyze the car image to detect damages.
              
              INSTRUCTIONS:
              1. Detect ALL damages (scratches, dents, cracks, rust, broken parts).
              2. For each damage, return a TIGHT bounding box [ymin, xmin, ymax, xmax] (0-1000 scale).
              3. Estimate severity (Minor/Moderate/Severe).
              4. If the car is perfect, return empty damages list.`
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: DAMAGE_SCHEMA,
        temperature: 0.2, 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");

    const data = JSON.parse(text) as DamageReport;
    
    // Add unique IDs
    data.damages = data.damages.map((d, i) => ({
      ...d,
      id: `damage-${i}-${Date.now()}`
    }));

    return data;

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    // 2. Fallback Demo Mode (Key exists but call failed)
    console.warn("AutoSpector: API Call failed. Falling back to Demo Mode.");
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return generateMockResponse("DEMO MODE (Fallback): API connection failed or key is invalid. Showing simulated results.");
  }
};