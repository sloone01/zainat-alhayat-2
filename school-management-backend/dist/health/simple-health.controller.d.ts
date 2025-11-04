export declare class SimpleHealthController {
    check(): {
        status: string;
        timestamp: string;
        uptime: number;
        environment: string;
        version: string;
        memory: {
            used: number;
            total: number;
        };
        database: string;
        service: string;
    };
    simpleCheck(): {
        status: string;
        timestamp: string;
        service: string;
    };
}
