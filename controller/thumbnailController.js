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


export {createThumbnail};