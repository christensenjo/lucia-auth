<script setup lang="ts">
const { data } = await useFetch('/api/session/generateSessionToken', {
    method: 'post',
    body: { test: 123}
});
</script>

<template>
    <div class="flex flex-col items-center">
        <div class="my-32 text-white text-4xl text-center font-bold">
            <h1 class="bg-white text-fortress-200 p-4">Title</h1>
            <pre>{{ data }}</pre>
        </div>

        <div class="h-12 w-36 flex bg-fortress-200 justify-center text-center items-center">
            <p class="font-bold text-primary">Primary</p>
        </div>
    </div>
</template>
