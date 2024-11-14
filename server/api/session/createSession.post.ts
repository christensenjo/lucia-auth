import { encodeHexLowerCase } from "@oslojs/encoding";
import { db } from "../../db";
import { Session } from "../auth";
import { sha256 } from "@oslojs/crypto/sha2";

export async function createSession(token: string, userId: number): Promise<Session> {
    // Hash the token using SHA-256 and encode it as hex to get the session ID
    // Hashing the token ensures that if the database contents were leaked, the attacker won't be able to retrieve valid tokens
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const session: Session = {
        id: sessionId,
        userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days expiry
    };
    await db.execute(
        "INSERT INTO user_session (id, user_id, expires_at) VALUES (?, ?, ?)",
        session.id,
        session.userId,
        session.expiresAt
    );
    return session;
}
