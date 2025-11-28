"use client";
import { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import io from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
const socket = io(SOCKET_URL);

export default function CameraCapture() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const [status, setStatus] = useState("Click Start to begin");
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    async function loadModels() {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);

      setModelsLoaded(true);
      setStatus("Models Loaded ✔ Ready to start camera");
    }
    loadModels();

    // 🔥 LISTEN TO BACKEND RESPONSE
    socket.on("recognized", (data) => {
      console.log("⚡ Backend response:", data);

      if (data.error) {
        setStatus("❌ Backend Error: " + data.error);
        return;
      }

      if (data.matched_user_id) {
        setStatus(
          `🎉 Recognized User: ${data.matched_user_id} (Conf: ${data.confidence?.toFixed(
            2
          )})`
        );
      } else {
        setStatus("❌ No match found for this frame");
      }
    });
  }, []);

  const startCamera = async () => {
    if (!modelsLoaded) {
      setStatus("Models still loading...");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });

      videoRef.current.srcObject = stream;
      streamRef.current = stream;

      await videoRef.current.play();
      setStatus("Camera started — detecting faces...");

      intervalRef.current = setInterval(async () => {
        if (!videoRef.current) return;

        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        if (detections.length > 0) {
          const box = detections[0].detection.box;
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

          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

          // 🔥 SEND FRAME TO BACKEND
          socket.emit("frame", {
            image: dataUrl,
            meta: { location: "Main Gate" },
          });
        }
      }, 800);
    } catch (err) {
      setStatus("Camera error: " + err.message);
    }
  };

  const stopCamera = () => {
    setStatus("Camera stopped");

    if (intervalRef.current) clearInterval(intervalRef.current);
    if (streamRef.current)
      streamRef.current.getTracks().forEach((t) => t.stop());

    videoRef.current.srcObject = null;
  };

  return (
    <div>
      <video
        ref={videoRef}
        width={640}
        height={480}
        style={{ border: "1px solid #ccc", marginBottom: 10 }}
      />

      <div style={{ marginBottom: 10, fontSize: "18px", fontWeight: "bold" }}>
        {status}
      </div>

      <button
        onClick={startCamera}
        style={{ padding: "10px 20px", marginRight: 10 }}
      >
        ▶ Start Camera
      </button>

      <button onClick={stopCamera} style={{ padding: "10px 20px" }}>
        ⏹ Stop Camera
      </button>
    </div>
  );
}
