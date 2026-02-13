import '@testing-library/jest-dom'
import 'whatwg-fetch'
import '@anthropic-ai/sdk/shims/node'

// Polyfill Response.json for tests (static method)
if (typeof Response !== 'undefined' && !Response.json) {
  Response.json = function(data, init) {
    const body = JSON.stringify(data);
    const headers = new Headers(init?.headers || {});
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    return new Response(body, {
      ...init,
      headers,
    });
  };
}

// Fix NextResponse.json for jsdom environment
// The issue is that the body stream isn't properly initialized in jsdom
const { NextResponse } = require('next/server');
const originalJson = NextResponse.json.bind(NextResponse);
NextResponse.json = function(data, init) {
  const response = originalJson(data, init);
  // Force the body to be properly readable by pre-caching it
  const bodyText = JSON.stringify(data);
  Object.defineProperty(response, '__cachedBody', {
    value: bodyText,
    writable: false,
  });
  const originalJsonMethod = response.json.bind(response);
  response.json = async function() {
    if (this.__cachedBody) {
      return JSON.parse(this.__cachedBody);
    }
    return originalJsonMethod();
  };
  return response;
};
