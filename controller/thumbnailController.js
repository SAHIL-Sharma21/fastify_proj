import {Thumbnail} from '../models/thumbnail.js';
import path from 'path';
import fs from 'fs';
import {pipeline} from 'stream';
import util from 'util'


 
const pipelineAsync = util.promisify(pipeline);


const createThumbnail = async (request, reply) => {
    try {
        const parts = request.part();
        let fields = {};
        let fileName;

        for await(const part of parts){
            if(part.file){
                const filename = `${Date.now()}-${part.fileName}`;
                const saveTo = path.join(
                    __dirname,
                    "..",
                    "uploads",
                    "thumbnails",
                    filename
                );
                //process the file
                await pipelineAsync(part.file, fs.createWriteStream(saveTo))
            } else {
                fields[part.fileName] = part.value; 
            }
        }

        const thumbnail = new Thumbnail({
            user: request.user.id,
            videoName: fields.videoName,
            version: fields.version,
            image: `/uploads/thumbnails/${fileName}`,
            paid: fields.paid === "true"
        });


        await thumbnail.save();
        reply.code(201).send(thumbnail);
    } catch (err) {
        reply.send(err)
    }
}


const getThumbnails = async(request, reply) => {
    try {
        const thumbnails = await Thumbnail.find({
            user: request.user.id,
        })      
        reply.send(thumbnails);
    } catch (err) {
        reply.send(err)
    }
}


const getThumbnail = async (request, reply) => {
    try {
        const thumbnail = await Thumbnail.findOne({
            _id: request.params.id,
            user: request.user.id,
        });

        if(!thumbnail){
            return reply.notFound("Thubnail not found")
        }
        reply.send(thumbnail);
    } catch (err) {
        reply.send(err);
    }
}


const updateThumbnail = async(request, reply) => {
    try {
        const updatedData = request.body;
        const thumbnail = await Thumbnail.findByIdAndUpdate(
            {
                _id: request.params.id,
                user: request.user.id
            },
            updatedData,
            {new: true}
        );

    if(!thumbnail){
        return reply.notFound("Thumbnail not found");
    }
    reply.send(thumbnail);
    } catch (err) {
        reply.send(err);
    }
}


const deleteThumbnail = async (request, reply) => {
    try {
        const thumbnail = await Thumbnail.findByIdAndDelete(
            {
                _id: request.params.id,
                user: request.user.id,
            }
        );
        if(!thumbnail){
            return reply.notFound("Thumbnail not found")
        }

        const filePath = path.join(
            __dirname,
            "..",
            "uploads",
            "thumbnails",
            path.basename(thumbnail.image)
        );

        fs.unlink(filePath, (err) => {
            if(err){
                fastify.log.error(err);
            }
        })

        reply.send({message: "Thumbnail deleted"});
    } catch (err) {
        reply.send(err);
    }
}

const deleteAllThumbnails = async(request, reply) => {
    try {
        
        const thumbnails = await Thumbnail.find(
            {user: request.user.id}
        );

        await Thumbnail.deleteMany({user: request.user.id})

        for(const thumbnail of thumbnails){
            const filePath = path.join(
                __dirname,
                "..",
                "uploads",
                "thumbnails",
                path.basename(thumbnail.image)
            );
            fs.unlink(filePath, (err) => {
                if(err) fastify.log.error(err)
            });
        }
        reply.send({message: "All thumbnails deleted"});
    } catch (err) {
        reply.send(err);
    }
}

export {createThumbnail, getThumbnails, getThumbnail, updateThumbnail, deleteThumbnail, deleteAllThumbnails};