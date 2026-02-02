
import { GoogleGenAI, Type } from "@google/genai";
import { Task, TaskStatus, UserMood, EnergyLevel, TaskPriority, TaskCategory } from "../types";

export const aiService = {
  async analyzeProcrastination(tasks: Task[]): Promise<{ suggestion: string; splitTask?: string }> {
    try {
      const pending = tasks.filter(t => t.status === TaskStatus.PENDING);
      if (pending.length === 0) return { suggestion: "Barcha vazifalar bajarilgan, ajoyib!" };

      const oldTasks = pending.filter(t => {
        const created = new Date(t.createdAt).getTime();
        const now = Date.now();
        return (now - created) > (48 * 60 * 60 * 1000); // 2+ days
      });

      if (oldTasks.length > 0) {
        const target = oldTasks[0];
        // Fix: Always initialize GoogleGenAI inside the method to ensure latest API key is used.
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Vazifa: "${target.text}". Bu vazifa 2 kundan beri tugallanmayapti. Uni 3 ta kichik bo'lakka bo'lib ber. Faqat bo'laklarni uzbek tilida ro'yxat ko'rinishida yoz.`
        });
        // Fix: Use the .text property directly.
        return { 
          suggestion: `"${target.text}" vazifasi kechikmoqda. Kichik bo'laklarga ajratdik:`,
          splitTask: response.text 
        };
      }
      return { suggestion: "Sizda kechikayotgan vazifalar yo'q. Shunday davom eting!" };
    } catch {
      return { suggestion