async function main() {
  try {
    const response = await fetch("http://localhost:8080/api/health");
    const data = await response.json();
    console.log("Active server on 8080 found:", data);
  } catch (err) {
    console.log("No server running on port 8080 (expected behavior if clean):", err.message);
  }
}

main();
