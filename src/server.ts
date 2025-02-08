'reflect-metadata';
import { App } from './app';

new App().start().catch((error) => {
    console.error('Failed to start application:', error); process.exit(1);
});