import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AIVoicePanel({ user }) {
  const [room, setRoom] = useState("");
  const [rooms, setRooms] = useState([]);
    useEffect(() => {
      // Fetch available rooms from backend
      axios.get("/audio/room_map").then(res => {
        const roomList = Object.values(res.data).filter(Boolean);
        setRooms([...new Set(roomList)]); // Unique, non-empty rooms
        if (roomList.length && !room) setRoom(roomList[0]);
      });
    }, []);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAIResponse] = useState("");
  const [ttsAudio, setTTSAudio] = useState(null);

  // Simple browser audio recording (Web Audio API)
  let mediaRecorder = null;
  let audioChunks = [];

  const startRecording = async () => {
    setTranscript("");
    setAIResponse("");
    setTTSAudio(null);
    setRecording(true);
    audioChunks = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new window.MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: "audio/wav" });
      setAudioBlob(blob);
    };
    mediaRecorder.start();
    window._mediaRecorder = mediaRecorder;
  };

  const stopRecording = () => {
    setRecording(false);
    if (window._mediaRecorder) window._mediaRecorder.stop();
  };

  const sendAudio = async () => {
    if (!audioBlob || !room) return;
    const formData = new FormData();
    formData.append("room", room);
    formData.append("file", audioBlob, "audio.wav");
    const sttRes = await axios.post("/ai_voice/speech_to_text", formData, { headers: { "Content-Type": "multipart/form-data" } });
    setTranscript(sttRes.data.transcript);
    const aiRes = await axios.post("/ai_voice/ai_query", { room, text: sttRes.data.transcript });
    setAIResponse(aiRes.data.response);
    const ttsRes = await axios.post("/ai_voice/text_to_speech", { room, text: aiRes.data.response });
    // Convert hex string to audio blob
    const audioBytes = new Uint8Array(ttsRes.data.audio_wav.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    setTTSAudio(new Blob([audioBytes], { type: "audio/wav" }));
  };

  return (
    <div style={{ border: "2px solid #4a90e2", margin: 16, padding: 16 }}>
      <h2>AI Voice Interactivity</h2>
      <div>
        Room: {rooms.length ? (
          <select value={room} onChange={e => setRoom(e.target.value)}>
            {rooms.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        ) : (
          <input value={room} onChange={e => setRoom(e.target.value)} placeholder="e.g. Living Room" />
        )}
      </div>
      <div style={{ margin: 8 }}>
        {!recording ? (
          <button onClick={startRecording}>Start Recording</button>
        ) : (
          <button onClick={stopRecording}>Stop Recording</button>
        )}
        {audioBlob && <button onClick={sendAudio}>Send Audio</button>}
      </div>
      {transcript && <div><b>Transcript:</b> {transcript}</div>}
      {aiResponse && <div><b>AI Response:</b> {aiResponse}</div>}
      {ttsAudio && (
        <audio controls src={URL.createObjectURL(ttsAudio)} />
      )}
        <div style={{ marginTop: 16, borderTop: "1px solid #eee", paddingTop: 12 }}>
          <h3>Voice Volume Controls</h3>
          <LocalVolumeControl />
          <DeviceVolumeControl rooms={rooms} />
        </div>
    </div>
  );
}
