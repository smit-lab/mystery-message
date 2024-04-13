import mongoose from "mongoose";

type connectionObject = {
  isConnected?: number;
};

const connection: connectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Database is already connected! Bro");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI || "");
    connection.isConnected = db.connections[0].readyState;
    console.log("Database connected successfully! Hurray");
  } catch (error) {
    console.log("Database connection failed: Sad", error);
    process.exit(1);
  }
}

export default dbConnect;
