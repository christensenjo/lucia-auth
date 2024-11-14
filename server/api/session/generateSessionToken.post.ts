import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";

/*
    When a user signs in, 
    1) generate a session token with generateSessionToken() and
    2) create a session linked to it with createSession().

    The token is provided to the user client.

*/
export default defineEventHandler((event) => {
    // Generate a random 20-byte token using a secure source (for us, crypto.getRandomValues)
    // Then encode it. base32 is alphanumeric and not case-sensitive
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const token = encodeBase32LowerCaseNoPadding(bytes);
    return token;
});