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
});
