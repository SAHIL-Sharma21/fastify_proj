//building plugins
import fp from 'fastify-plugin';
import mongoose from 'mongoose';

const fastifyMongo = fp(async(fastify, opts) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        fastify.decorate("mongoose", mongoose)
        fastify.log.info("MongoDB connected!")
    } catch (error) {
        fastify.log.error(error)
        process.exit(1)
    }
});

export {fastifyMongo};