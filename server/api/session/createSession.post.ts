import { encodeHexLowerCase } from "@oslojs/encoding";
import { db } from "../../db";
import { Session } from "../auth";
import { sha256 } from "@oslojs/crypto/sha2";
import { readBody } from "h3";

export default defineEventHandler(async (event) => {
    // Read token and userId from the request body
    const body = await readBody(event);
    const token = body?.token;
    const userId = body?.userId;

    // Validate input
    if (!token || !userId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Token and userId are required"
        });
    }

    // Generate the session ID by hashing the token
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    
    // Create the session object
    const session: Session = {
        id: sessionId,
        userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days expiry
    };

    // Insert the session into the database
    await db.execute(
        "INSERT INTO user_session (id, user_id, expires_at) VALUES (?, ?, ?)",
        session.id,
        session.userId,
        session.expiresAt
    );

    // Return the session object
    return { session };
});
