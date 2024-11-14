import { db } from "../../db";

export async function invalidateSession(sessionId: string): Promise<void> {
    await db.execute("DELETE FROM user_session WHERE id = ?", sessionId);
}