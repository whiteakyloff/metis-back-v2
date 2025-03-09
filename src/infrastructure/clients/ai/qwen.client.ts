import { Inject, Service } from "typedi";

import { OpenAI } from "openai";

import { BaseAIClient } from "@domain/clients/impl.client";
import { AppConfig } from "@config";
import { AppError } from "@infrastructure/errors/app.error";

@Service()
export class QwenClient extends BaseAIClient<OpenAI> {
    private client: OpenAI | null = null;

    constructor(
        @Inject('config')
        private readonly config: AppConfig
    ) { super() }

    public getBase(): OpenAI {
        if (!this.client) {
            throw new AppError('QWEN_ERROR', 'QwenAI client is not connected', 400);
        }
        return this.client;
    }

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
        try {
            const response = await this.client.chat.completions.create({
                model: "qwen-plus",
                messages: [
                    { role: "system", content: "When you receive a message containing a word or words and a target language, please perform the following steps: " +
                            "1. Translate the words into the specified language." +
                            "2. Generate the phonetic transcription (i.e., pronunciation) of the translated word." +
                            "3. Reply with ONLY the answer formatted exactly as: [translated words]: [transcription]" +
                            "No explanations, notes, or additional text should be included." +
                            "For proper nouns and brand names that are conventionally kept the same across languages, maintain the original word." +
                            "For example, if the input is:" +
                            "- Words: \"hello\"" +
                            "- Language: Spanish" +
                            "Your output should be:" +
                            "hola: [ˈo.la]" +
                            "Sentences must be in 1 string, for example:" +
                            "- Words: \"hello! how are you doing?\"" +
                            "- Language: English" +
                            "Your output should be:" +
                            "hello! how are you doing?: [həˈloʊ haʊ ɑːr juː ˈduɪŋ]" +
                            "You must detect global words (towns, cities, countries, etc.) and translate them correctly. For example:" +
                            "- Words: \"I love Swansea!\"" +
                            "- Language: Welsh" +
                            "Your output should be:" +
                            "Rwyf yn caru Abertawe!: [rʊɪv ən kɑːru abɛrˈtau.ɛ]" +
                            "Be sure to translate the actual words provided, not the literal string \"words\". For example:" +
                            "- Words: \"Привіт\"" +
                            "- Language: Welsh" +
                            "Your output should be:" +
                            "Helo: [ˈhɛ.lɔ]" +
                            "Remember: you must translate the words qualitatively, so that the sentences make sense and sound in the language you are translating into." +
                            "For example:" +
                            "- Words: \"Le cuesta mucho tragársela todo.\"" +
                            "- Language: Ukrainian." +
                            "Your output should be:" +
                            "Йому важко все це проковтнути: [jɔˈmu ˈvɑʒkɔ ˈvse ˈtse prɔˌkɔwtnuˈtɪ]" +
                            "Remember, that your answer must be strongly formatted like: [translated words]: [transcription]"},
                    { role: "user", content: text }
                ]
            });
            return response.choices[0].message.content;
        } catch (error) {
            throw new AppError('QWEN_ERROR', 'Error processing request with QwenAI', 400);
        }
    }
}