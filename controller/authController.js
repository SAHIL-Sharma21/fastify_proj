import {User} from '../models/user.js'
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';


const register = async(request, reply) => {
    try {
        const {name, email, password, country} = request.body;
        
        if(![name, email, password, country].some((field) => !field)){
            throw new Error("Enter all the fields")
        }

        const hashedPassword = await bcryptjs.hash(password, 12);

        const user = User.create({name, email, password: hashedPassword, country});
        (await user).save();

        reply.code(201).send({message: "User register successfully"});
    } catch (err) {
        reply.send(err);
    }
};


const login = async(request, reply) => {
    try {
        const {email, password} = request.body;

        if(!email || !password){
            throw new Error("Email and password are required");
        }   

        const user = await User.findOne({
            email,
        });

        if(!user){
            return reply.code(400).send({message:"Invalid email or user"});
        }

        //validate the password
        const isValid = await bcryptjs.compare(password, user.password);

        if(!isValid){
            return reply.code(400).send({message: "Invalid email or password"});
        }

        console.log(request.server) // for debugging
        const token = request.server.jwt.sign({id: user._id}); // have to look for this line.....

        reply.send({token});
    } catch (err) {
        reply.send(err);
    }
};


const forgotPassword = async(request, reply) => {
    try {
        const {email} = request.bodyl

        const user = await User.findOne({email});

        if(!user){
            reply.notFound("User not found")
        }

        const resetToken = crypto.randomBytes(32).toString("hex")
        const resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiry = resetPasswordExpire;

        await user.save({validateBeforeSave: false});

        const resetUrl = `http://localhost:${process.env.PORT}/api/auth/reset-password/${resetToken}`

        reply.send({resetUrl});

    } catch (err) {
        reply.send(err);
    }
}


const resetPassword = async(request, reply) => {
    try {
        const resetToken = request.params.token;
        const {newPassword} = request.body;

        const user = await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpiry: {$gt: Date.now() },
        });

        if(!user){
            return reply.badRequest("Invalid or expired password reset token")
        }

        //hash the password
        const hashedPassword = await bcryptjs.hash(newPassword, 12);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();

        return reply.send({message: "password reset successfully"});
    } catch (err) {
        reply.send(err)
    }
}


export {register, login, forgotPassword, resetPassword};