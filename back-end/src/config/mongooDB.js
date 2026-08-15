import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();



export const connectDB = async() => {
    try{
        if (!process.env.DB_URI) {
            console.log("DB_URI not configured, skipping MongoDB connection.");
            return;
        }
        mongoose.set('strictQuery', false)
        await mongoose.connect(process.env.DB_URI)
        console.log("connected to:", mongoose.connection.name)
    }
    catch(error){
        console.log("MongoDB connection error:", error.message)
    }
}

