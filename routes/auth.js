import {forgotPassword, login, logout, register, resetPassword} from '../controller/authController.js';


export const authRouter = async(fastify, opts) => {
    fastify.post("/register", register);
    fastify.post(".login", login);
    fastify.post("/forgot-password", forgotPassword);
    fastify.post("/reset-password/:token", resetPassword);
    fastify.post("/logout", {
        preHandler: [fastify.authenticate], //middleware in fastify and we have to write plugin for that
    } ,logout)
}

