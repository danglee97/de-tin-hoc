import { GoogleGenAI, Type } from "@google/genai";
import { EducationalLevel, ExamPeriod, GeneratedExam } from '../types';

export interface ExamGenerationParams {
  grade: string;
  level: EducationalLevel;
  period: ExamPeriod;
  subject: string;
  duration: number;
  lessons: string;
  lessonPlanContent: string;
  prompt: string;
  images?: { mimeType: string; data: string }[];
}

// FIX: Use import.meta.env for Vite environment variables. The variable in the .env file must be named VITE_API_KEY.
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

export const generateExam = async (params: ExamGenerationParams): Promise<GeneratedExam> => {
  // FIX: Use the recommended 'gemini-2.5-flash' model for text tasks.
  const model = 'gemini-2.5-flash';

  const systemInstruction = `You are an expert assistant for creating educational exams in Vietnam.
You must follow the Vietnamese General Education Program 2018 (Chương trình GDPT 2018).
Your task is to generate a complete exam package based on the user's specifications.
The output must be a valid JSON object matching the provided schema.
All content must be in Vietnamese.
The exam questions should be appropriate for the specified grade and educational level.
The matrix and specification tables must be valid HTML table strings.
Each question must have a unique 'question_id' in the format 'Q1', 'Q2', etc.
The 'options' array for multiple choice questions should contain only the option text, without any prefixes like "A.", "B.", etc.
The answer key must correspond to the questions using the same 'question_id'.`;

  const userPrompt = `Please generate an exam with the following specifications:
- Subject: ${params.subject}
- Grade: ${params.grade}
- Educational Level: ${params.level}
- Exam Period: ${params.period}
- Duration: ${params.duration} minutes
- Lessons to focus on: ${params.lessons || 'Not specified'}
- Content from lesson plans provided by user:
${params.lessonPlanContent || 'None provided.'}
${params.images && params.images.length > 0 ? '- The user has also provided images. Please analyze them and create relevant questions if applicable.' : ''}
- Additional requirements: ${params.prompt || 'None'}`;

  // FIX: Define a response schema to get structured JSON output from the model.
  const schema = {
    type: Type.OBJECT,
    properties: {
      matrix: {
        type: Type.STRING,
        description: "Ma trận đề kiểm tra (exam matrix) as a complete, valid HTML table string. It must use <table>, <thead>, <tbody>, <tr>, <th>, and <td> tags. Use colspan and rowspan attributes where necessary to create nested headers and merged cells, matching the official Vietnamese educational format. Do not include any CSS styles."
      },
      specification: {
        type: Type.STRING,
        description: "Bản đặc tả đề kiểm tra (exam specification) as a complete, valid HTML table string. It must use <table>, <thead>, <tbody>, <tr>, <th>, and <td> tags. Use colspan and rowspan attributes where necessary, similar to the matrix format. Do not include any CSS styles."
      },
      exam: {
        type: Type.ARRAY,
        description: 'List of exam questions.',
        items: {
          type: Type.OBJECT,
          properties: {
            question_id: { type: Type.STRING, description: 'Unique ID for the question (e.g., "Q1").' },
            question_text: { type: Type.STRING, description: 'The text of the question.' },
            question_type: { type: Type.STRING, description: 'Type of question (e.g., "MULTIPLE_CHOICE", "SHORT_ANSWER", "TRUE_FALSE").' },
            options: {
              type: Type.ARRAY,
              description: 'List of options for multiple choice questions. Should be omitted for other types.',
              items: { type: Type.STRING }
            }
          },
          required: ['question_id', 'question_text', 'question_type']
        }
      },
      answer_key: {
        type: Type.ARRAY,
        description: 'List of answers and explanations for the exam.',
        items: {
          type: Type.OBJECT,
          properties: {
            question_id: { type: Type.STRING, description: 'ID of the question this answer corresponds to.' },
            answer: { type: Type.STRING, description: 'The correct answer. For multiple choice, this is the option text. For true/false, it is "True" or "False".' },
            explanation: { type: Type.STRING, description: 'An optional explanation for the answer.' }
          },
          required: ['question_id', 'answer']
        }
      }
    },
    required: ['matrix', 'specification', 'exam', 'answer_key']
  };

  const parts: any[] = [{ text: userPrompt }];
  if (params.images) {
    for (const image of params.images) {
      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }
  }

  try {
    // FIX: Use ai.models.generateContent with model name, prompt parts, and a config object.
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
      },
    });

    // FIX: Extract text directly from the response object using the .text property.
    const jsonText = response.text;
    const generatedExam: GeneratedExam = JSON.parse(jsonText);
    return generatedExam;

  } catch (error) {
    console.error("Error generating exam with Gemini API:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate exam: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating the exam.');
  }
};