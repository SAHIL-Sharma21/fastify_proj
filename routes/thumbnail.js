import {createThumbnail, getThumbnail, getThumbnails,  updateThumbnail, deleteAllThumbnails, deleteThumbnail} from '../controller/thumbnailController.js'

export const thumbnailRouter = async(fastify, opts) => {
    fastify.register(async function(fastify){
        fastify.addHook("preHanldler", fastify.authenticate);

        fastify.post("/", createThumbnail);
        fastify.get("/", getThumbnails);
        fastify.get("/:id", getThumbnail);
        fastify.put("/:id", updateThumbnail);
        fastify.delete("/:id", deleteThumbnail);
        fastify.delete("/", deleteAllThumbnails);
    })
}
