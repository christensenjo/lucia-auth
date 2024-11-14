// Prevent CSRF attacks by checking the content type of non-GET requests
// https://www.youtube.com/watch?v=v8tcmGg-R7U
export default defineEventHandler((event) => {
    const method = event.node.req.method;
    const contentType = event.node.req.headers["content-type"];

    if (method !== "GET" && contentType !== "application/json") {
        throw createError({
            statusCode: 415,
            statusMessage: 'Unsupported content type. Non-GET requests must include a JSON body in the request.'
        })
    }

    // Alternatively, we could do something like what Lucia suggests:
    /*

        CSRF protection is a must when using cookies. A very simple way to prevent CSRF attacks is to check the Origin header for non-GET requests. If you rely on this method, it is crucial that your application does not use GET requests for modifying resources.

        // `HTTPRequest` and `HTTPResponse` are generic interfaces.
        // Adjust this code to fit your framework's API.

        function handleRequest(request: HTTPRequest, response: HTTPResponse): void {
            if (request.method !== "GET") {
                const origin = request.headers.get("Origin");
                // You can also compare it against the Host or X-Forwarded-Host header.
                if (origin === null || origin !== "https://example.com") {
                    response.setStatusCode(403);
                    return;
                }
            }

            // ...
        }

    */
});
