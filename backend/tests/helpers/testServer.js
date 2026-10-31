import http from 'node:http';
import app from '../../src/app.js';

let server = null;
let baseUrl = '';

export async function startTestServer() {
    if (server) return baseUrl;
    return new Promise((resolve) => {
        server = http.createServer(app);
        server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            baseUrl = `http://127.0.0.1:${address.port}`;
            resolve(baseUrl);
        });
    });
}

export async function stopTestServer() {
    if (!server) return;
    return new Promise((resolve) => {
        server.close(() => {
            server = null;
            baseUrl = '';
            resolve();
        });
    });
}

export async function request(path, options = {}) {
    if (!server) {
        await startTestServer();
    }
    const url = `${baseUrl}${path}`;
    const headers = { ...options.headers };
    if (options.body && typeof options.body === 'object' && !(options.body instanceof String)) {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
    }
    const response = await fetch(url, {
        ...options,
        headers
    });
    const text = await response.text();
    let body;
    try {
        body = JSON.parse(text);
    } catch {
        body = text;
    }
    return {
        status: response.status,
        headers: response.headers,
        body
    };
}
