// Session Token -> used instead of ID directly         -> ephemeral
// User ID                                              -> user_session.user_id && app_user.id
// Session ID    -> sha-256 (one-way) hash of the token -> user_session.id

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