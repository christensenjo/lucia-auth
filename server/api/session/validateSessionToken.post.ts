import { db } from "../../db.js";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { Session, User } from '../auth.js';
import { readBody } from 'h3';

export default defineEventHandler(async (event) => {
    // Read token from request body
    const body = await readBody(event);
    const token = body?.token;

    if (!token) {
        throw createError({
            statusCode: 400,
            statusMessage: "Token is required"
        });
    }

    // Generate sessionId by hashing the token
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    
    // Query the database for the session
    const row = await db.queryOne(
        "SELECT user_session.id, user_session.user_id, user_session.expires_at FROM user_session INNER JOIN app_user ON app_user.id = user_session.user_id WHERE id = ?",
        sessionId
    );
    
    // If no session found, return null
    if (row === null) {
        return { session: null, user: null };
    }

    const session: Session = {
        id: row[0],
        userId: row[1],
        expiresAt: row[2]
    };
    const user: User = {
        id: row[3]
    };

    // Check if session is expired
    if (Date.now() >= session.expiresAt.getTime()) {
        await db.execute("DELETE FROM user_session WHERE id = ?", session.id);
        return { session: null, user: null };
    }

    // Extend session if active within 15 days of expiry
    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
        session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
        await db.execute(
            "UPDATE user_session SET expires_at = ? WHERE id = ?",
            session.expiresAt,
            session.id
        );
    }

    // Return the session and user data
    return { session, user };
});
