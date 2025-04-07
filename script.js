function analyzeCode() {
    const code = document.getElementById("codeInput").value;

    fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
    })
    .then(response => response.json())
    .then(data => {
        localStorage.setItem("analysis", JSON.stringify(data));
        window.location.href = "result.html";
    })
    .catch(error => console.error("Error:", error));
}
