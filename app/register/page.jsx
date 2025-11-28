"use client";
import { useState, useRef } from "react";
import * as faceapi from "face-api.js";

export default function RegisterUser() {
  const videoRef = useRef(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState("Ready to capture");

  // Load models once
  const loadModels = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
  };

  const startCamera = async () => {
    await loadModels();

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    videoRef.current.srcObject = stream;
    await videoRef.current.play();
  };

  const captureImage = async () => {
    const detections = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    if (!detections) {
      setStatus("❌ No face detected — Try again");
      return;
    }

    const box = detections.detection.box;
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;

    const ctx = canvas.getContext("2d");
    const size = Math.max(box.width, box.height);

    ctx.drawImage(
      videoRef.current,
      box.x,
      box.y,
      size,
      size,
      0,
      0,
      200,
      200
    );

    const img = canvas.toDataURL("image/jpeg", 0.9);

    setImages((prev) => [...prev, img]);
    setStatus(`Captured ${images.length + 1} images`);
  };

  const registerUser = async () => {
    if (!name || !email || images.length < 5) {
      setStatus("❌ Provide name, email & capture at least 5 images");
      return;
    }

    setStatus("⏳ Registering user...");

    const resp = await fetch("http://localhost:3001/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, images }),
    });

    const data = await resp.json();

    if (data.ok) {
      setStatus("✅ User Registered Successfully!");
      setImages([]);
    } else {
      setStatus("❌ " + data.error);
    }
  };

  return (
    <div>
      <h2>User Registration</h2>

      <input
        type="text"
        placeholder="Full Name"
        onChange={(e) => setName(e.target.value)}
      />
      <br />

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />

      <button onClick={startCamera}>Start Camera</button>

      <div>
        <video
          ref={videoRef}
          width={400}
          height={300}
          style={{ border: "1px solid black" }}
        ></video>
      </div>

      <button onClick={captureImage}>📸 Capture Face</button>

      <button onClick={registerUser}>📥 Register User</button>

      <p>{status}</p>

      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        {images.map((img, i) => (
          <img key={i} src={img} width={80} height={80} />
        ))}
      </div>
    </div>
  );
}
