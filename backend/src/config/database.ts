import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;

const connectDB = async (): Promise<void> => {
    try {
        // Use in-memory MongoDB for development
        if (process.env.NODE_ENV === 'development') {
            mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
            console.log('MongoDB Memory Server Connected');
            return;
        }

        // Use regular MongoDB for production
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/localkart');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${(error as Error).message}`);
        process.exit(1);
    }
};

export default connectDB;
