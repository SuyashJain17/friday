async function run() {
  const res = await fetch('http://localhost:3001/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'kk' })
  });
  const text = await res.text();
  console.log("RESPONSE START\\n", text, "\\nRESPONSE END");
}
run();
