const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;

async function connectDB() {
    
    try{
        const conn = await mongoose.connect(MONGO_URI);
        
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }

    catch(error){

        console.log(`Database connection failed: `, error.message);
        process.exit(1);

    }
};

module.exports = connectDB;