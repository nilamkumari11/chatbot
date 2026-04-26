import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

export const client = createClient({
    url: `${process.env.REDIS_URL}`,
    password: `${process.env.REDIS_TOKEN}`,
})

client.on("error", (err) => console.log("Redis error", err));

await client.connect();

console.log("redis connected");