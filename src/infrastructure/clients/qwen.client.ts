import { Inject, Service } from "typedi";

import { OpenAI } from "openai";
import { IAIClient } from "@domain/clients/impl.client";

import { AppConfig } from "@config";
import { AppError } from "@infrastructure/errors/app.error";

@Service()
export class QwenClient implements IAIClient {
    private client: OpenAI | null = null;

    constructor(
        @Inject('config')
        private readonly config: AppConfig
    ) {}

    async connect() {
        const { apiKey, baseURL } = this.config.qwen;
        try {
            this.client = new OpenAI({ apiKey, baseURL });
        } catch (error) {
            throw new AppError('QWEN_ERROR', 'Error connecting to QwenAI', 400);
        }
    }

    async disconnect() {
        try {
            if (this.client) {
                this.client = null;
            }
        } catch (error) {
            throw new AppError('QWEN_ERROR', 'Error disconnecting from QwenAI', 400);
        }
    }

    async doRequest(text: string): Promise<string | null> {
        if (!this.client) {
            throw new AppError('QWEN_ERROR', 'QwenAI client is not connected', 400);
        }
        console.log('QwenAI request:', text);
        try {
            const response = await this.client.chat.completions.create({
                model: "qwen-plus",
                messages: [
                    { role: "system", content: "When you receive a message containing a word or words and a target language, please perform the following steps: " +
                            "1. Translate the words into the specified language." +
                            "2. Generate the phonetic transcription (i.e., pronunciation) of the translated word." +
                            "3. Reply with the answer formatted exactly as: words: transcription" +
                            "For example, if the input is:" +
                            "- Words: \"hello\"" +
                            "- Language: Spanish" +
                            "Your output should be:" +
                            "hola: [o.la]" },
                    { role: "user", content: text }
                ]
            });

            return response.choices[0].message.content;
        } catch (error) {
            throw new AppError('QWEN_ERROR', 'Error processing request with QwenAI', 400);
        }
    }
}