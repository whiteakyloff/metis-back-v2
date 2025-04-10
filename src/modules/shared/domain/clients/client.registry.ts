import { Service } from "typedi";
import { BaseClient } from "@shared/domain/clients/base.client";

@Service()
export class ClientRegistry {
    private readonly clients: Record<string, BaseClient<any>> = {};

    registerClient(name: string, client: BaseClient<any>): void {
        this.clients[name.toLowerCase()] = client;
    }

    getClient(name: string): BaseClient<any> | null {
        return this.clients[name.toLowerCase()] || null;
    }

    getClients(): Record<string, BaseClient<any>> {
        return this.clients;
    }

    async connectAll(): Promise<void> {
        await Promise.all(
            Object.values(this.clients).map(client => client.connect())
        );
    }

    async disconnectAll(): Promise<void> {
        await Promise.all(
            Object.values(this.clients).map(client => client.disconnect())
        );
    }
}