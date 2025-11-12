function generateSessionHash() {
  return Math.random().toString(36).substring(2, 15);
}

export async function callVoiceDemo(inputText) {
  const spaceURL = "https://tankariadarsh32-voice-demo.hf.space";
  const fn_index = 2;
  const sessionHash = generateSessionHash();

  console.log(`🟡 Space: ${spaceURL}`);
  console.log(`🧩 fn_index: ${fn_index}`);
  console.log(`🧠 Session hash: ${sessionHash}`);

  // Step 1️⃣ — Send text input to queue
  const joinResponse = await fetch(`${spaceURL}/gradio_api/queue/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [inputText, null, null, "en"],
      fn_index,
      session_hash: sessionHash,
      event_data: null,
      trigger_id: 17,
    }),
  });

  if (!joinResponse.ok) {
    throw new Error(`❌ Join failed: ${joinResponse.status}`);
  }

  console.log("✅ Job submitted! Waiting for completion...");

  // Step 2️⃣ — Read the stream until process_completed
  const response = await fetch(
    `${spaceURL}/gradio_api/queue/data?session_hash=${sessionHash}`
  );
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";
  let resultEvent = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    buffer += chunk;

    const events = chunk.split("\n").filter((l) => l.startsWith("data:"));
    for (const evt of events) {
      try {
        const json = JSON.parse(evt.replace(/^data:\s*/, ""));
        if (json.msg === "progress") {
          console.log(`⏳ ${json.progress_data?.[0]?.desc ?? ""}`);
        }
        if (json.msg === "process_completed") {
          console.log("✅ Model finished processing!");
          resultEvent = json;
        }
      } catch (_) {}
    }
  }

  if (!resultEvent) {
    throw new Error("❌ No process_completed event found.");
  }

  console.log("🧾 Final event:", resultEvent);

  // Step 3️⃣ — Extract the actual audio file URL
  const statusMessage = resultEvent.output?.data?.[0];
  const audioObject = resultEvent.output?.data?.[1];
  const audioUrl = audioObject?.url;

  if (!audioUrl) {
    console.error("❌ Audio URL not found in output:", resultEvent);
    throw new Error("Unexpected response format (no audio URL)");
  }

  console.log("🎧 Audio generated:", audioUrl);

  // Step 4️⃣ — Return the audio URL and message
  return {
    status: statusMessage,
    audioUrl,
  };
}
