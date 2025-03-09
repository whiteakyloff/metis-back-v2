import { Inject, Service } from "typedi";

import Anthropic from "@anthropic-ai/sdk";

import { BaseAIClient } from "@domain/clients/impl.client";
import { AppConfig } from "@config";
import { AppError } from "@infrastructure/errors/app.error";

@Service()
export class ClaudeClient extends BaseAIClient<Anthropic> {
    private client: Anthropic | null = null;

    constructor(
        @Inject('config')
        private readonly config: AppConfig
    ) { super() }

    public getBase(): Anthropic {
        if (!this.client) {
            throw new AppError('CLAUDE_CLIENT_ERROR', 'Claude Client is not connected', 400);
        }
        return this.client;
    }

    async connect(): Promise<void> {
        let { apiKey, timeout, maxRetries } = this.config.claude;

        try {
            this.client = new Anthropic({ apiKey, timeout, maxRetries });
        } catch (error) {
            throw new AppError('CLAUDE_CLIENT_ERROR', 'Error connecting to Claude Client', 400);
        }
    }

    async disconnect(): Promise<void> {
        try {
            if (this.client) {
                this.client = null;
            }
        } catch (error) {
            throw new AppError('CLAUDE_CLIENT_ERROR', 'Error disconnecting from Claude Client', 400);
        }
    }

    async doRequest(text: string): Promise<string | null> {
        const response = await this.client?.messages.create(
            {
                model: 'claude-3-5-sonnet-20241022', max_tokens: 100,
                temperature: 1.3, system: 'When you receive a message containing a word and a target language, please perform the following steps:\n' +
                    '\n' +
                    '1. Translate the word into the specified language.\n' +
                    '2. Generate the phonetic transcription (i.e., pronunciation) of the translated word.\n' +
                    '3. Reply with the answer formatted exactly as: "word: transcription"\n' +
                    '\n' +
                    'For example, if the input is:\n' +
                    '- Word: "hello"\n' +
                    '- Language: Spanish\n' +
                    '\n' +
                    'Your output should be:\n' +
                    'hola: [o.la]',
                messages: [{
                    "role": "user", "content": [{
                        type: "text", text
                    }]
                }]
            }
        )
        return response ? JSON.stringify(response) : null;
    }
}