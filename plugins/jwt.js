//writing custom plugins in fastify
import fp from 'fastify-plugin';
import {fastifyJwt} from '@fastify/jwt' //here we can get the error


export const jwtFastify = fp(async(fastify, opts) => {
    fastify.register(fastifyJwt, {
        secret: process.env.JWT_SECRET
    });

    fastify.decorate("authenticate", async function(request, reply){
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    })
}); 