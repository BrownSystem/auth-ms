"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const app_module_1 = require("./app.module");
const config_1 = require("./config");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const logger = new common_1.Logger('Auth-main');
    const app = await core_1.NestFactory.createMicroservice(app_module_1.AppModule, {
        transport: microservices_1.Transport.NATS,
        options: {
            servers: config_1.envs.natsServers,
        },
    });
    await app.listen();
    logger.log(`Auth service is running on port: ${config_1.envs.port} `);
}
bootstrap();
//# sourceMappingURL=main.js.map