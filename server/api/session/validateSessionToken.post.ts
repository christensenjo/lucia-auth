import { db } from "../../db.js";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { SessionValidationResult, Session, User } from '../auth.js';

/*
    Validate a user-provided token with validateSessionToken().
*/
export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
    // 1. Does the session exist in the database?
    // 2. Is the session expired?
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const row = await db.queryOne(
        "SELECT user_session.id, user_session.user_id, user_session.expires_at FROM user_session INNER JOIN app_user ON app_user.id = user_session.user_id WHERE id = ?",
        sessionId
    );
    if (row === null){
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
    // Session expired
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
    return { session, user };
}