import React, { useState } from "react";
import { callVoiceDemo } from "./api";

function App() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");


 const handleGenerate = async () => {
    setLoading(true);
    setAudioUrl("");
    setStatus("");
    try {
      const result = await callVoiceDemo(text);
      setStatus(result.status);
      setAudioUrl(result.audioUrl);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>🎙️ Voice Demo</h1>
      <p>Connects to your Hugging Face Space</p>

      <textarea
        placeholder="Enter text to convert..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={styles.textarea}
      />

      <button onClick={handleGenerate} style={styles.button} disabled={loading}>
        {loading ? "Generating..." : "Generate Voice"}
      </button>

      {audioUrl && (
        <div style={{ marginTop: "20px" }}>
          <h3>Preview:</h3>
          <audio controls src={audioUrl} />
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "40px",
    fontFamily: "Arial, sans-serif",
  },
  textarea: {
    width: "80%",
    height: "100px",
    margin: "20px 0",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "10px",
  },
  button: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
  },
};

export default App;
