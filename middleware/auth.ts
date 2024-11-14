export default defineNuxtRouteMiddleware(async (to) => {
    // Skip auth check for login page
    if (to.path === '/login' || to.path === '/') {
        return;
    }

    // Get session token from cookie
    const cookie = useCookie('session');
    if (!cookie.value) {
        return navigateTo('/login');
    }

    // Validate session token using the API endpoint
    const { data, error } = await useFetch('/api/session/validateSessionToken', {
        method: 'POST',
        body: { token: cookie.value }
    });

    if (error.value || !data.value?.session || !data.value?.user) {
        // Clear invalid session cookie
        cookie.value = null;
        return navigateTo('/login');
    }
});