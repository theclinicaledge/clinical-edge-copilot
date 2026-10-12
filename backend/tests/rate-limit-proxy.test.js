const test = require("node:test");
const assert = require("node:assert/strict");

process.env.ANTHROPIC_API_KEY ||= "test-key";
const { app } = require("../server");

// Behind Render's proxy every request arrives from the proxy address. The rate
// limiter must key on the client address from X-Forwarded-For instead, or all
// users would share one bucket.
test("rate limiting is per client behind one trusted proxy hop", async () => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  const post = (ip) => fetch(`http://127.0.0.1:${port}/api/sbar`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Forwarded-For": ip },
    body: "{}",
  });
  try {
    let last;
    for (let i = 0; i < 31; i += 1) last = await post("203.0.113.10");
    assert.equal(last.status, 429, "the 31st request from one client is limited");
    const other = await post("198.51.100.20");
    assert.notEqual(other.status, 429, "a different client keeps its own allowance");
  } finally {
    server.close();
  }
});

test("trust proxy is limited to one hop by default", () => {
  assert.equal(app.get("trust proxy"), 1);
});
