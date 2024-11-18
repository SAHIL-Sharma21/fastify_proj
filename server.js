//fastify server 
import Fastify from 'fastify';
import dotenv from 'dotenv';
import path from 'path';
import {fastifyEnv} from '@fastify/env';
import { fastifyCors } from '@fastify/cors';
import {fastifySensible} from '@fastify/sensible';
import {fastifyMongo} from './plugins/mongoDB.js'
import {jwtFastify} from './plugins/jwt.js'
import {authRouter} from './routes/auth.js'

const fastify = Fastify({logger: true});

dotenv.config({
    path: ".env"
});

//register plugins
fastify.register(fastifyCors)
fastify.register(fastifySensible);
fastify.register(fastifyEnv, {
    dotenv: true,
    schema: {
        type: "object",
        required: ["PORT", "MONGODB_URI", "JWT_TOKEN"],
        properties: {
            PORT: {
                type: "string",
                default: "3000"
            },
            MONGODB_URI: {
                type: "string"
            },
            JWT_TOKEN: {
                type: "string"
            }
        }
    }
});

//register custom plugin
fastify.register(fastifyMongo);
fastify.register(jwtFastify);

//register routes
fastify.register(authRouter, {prefix: "/api/auth"});


fastify.get("/", function(request, reply){
    reply.send({hello: "Fastify"});
});

//test DB connection
fastify.get("/test-db", async(request, reply) => {
    try {
        const mongoose = fastify.mongoose;
        const connectionState = mongoose.connection.readyState;

        let status = "";
        switch(connectionState) {
            case 0:
                status = "disconnected"
                break;
            case 1:
                status = "connected"
                break;
            case 2:
                status = "connecting"
                break;
            
            case 3:
                status = "disconnecting"
                break;

            default:
                status = "unknown"
                break;
        }

        reply.send({database: status})
    } catch (err) {
        fastify.log.error(err);
        reply.status(500).send({error: "Failed to test database."});
        process.exit(1);
    }
})


const start = async () => {
    try {
        fastify.listen({
            port: process.env.PORT
        });
        fastify.log.info(
            `Server is running at http://localhost:${process.env.PORT}`
        );
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
}

start();