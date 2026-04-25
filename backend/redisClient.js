import { createClient } from "redis";
require("dotenv").config();

export const client = createClient({
    url: `${process.env.REDIS_URL}`,
    password: `${process.env.REDIS_TOKEN}`,
})

client.on("error", (err) => console.log("Redis error", err));

await client.connect();