import { db } from "../db.js";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

// Session Token -> used instead of ID directly         -> ephemeral
// User ID                                              -> user_session.user_id && app_user.id
// Session ID    -> sha-256 (one-way) hash of the token -> user_session.id

/*
    When a user signs in, 
    1) generate a session token with generateSessionToken() and
    2) create a session linked to it with createSession().

    The token is provided to the user client.

*/
export function generateSessionToken(): string {
    // Generate a random 20-byte token using a secure source (for us, crypto.getRandomValues)
    // Then encode it. base32 is alphanumeric and not case-sensitive
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const token = encodeBase32LowerCaseNoPadding(bytes);
    return token;
}
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

export async function invalidateSession(sessionId: string): Promise<void> {
    await db.execute("DELETE FROM user_session WHERE id = ?", sessionId);
}

export type SessionValidationResult =
    | { session: Session; user: User }
    | { session: null; user: null };

export interface Session {
    id: string;
    userId: number;
    expiresAt: Date;
}

export interface User {
    id: number;
}