"use client";
import { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import io from "socket.io-client";
import { Play , Square } from "lucide-react";

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

      if (data.user_id) {
        setStatus(
          `🎉 Recognized User: ${data.user_id} (Conf: ${data.confidence?.toFixed(
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
      }, 1000);
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
      <div className="shadow-lg border border-gray-400 rounded-md mb-5">
        <video
          ref={videoRef}
          width={640}
          height={480}
        />
      </div>

      <div className="font-semibold text-xl mb-5 text-center">
        {status}
      </div>

      <div className="flex items-center justify-center gap-7">
        <button className="border-cyan-500 border px-3 py-2 rounded-lg cursor-pointer bg-cyan-500 mb-5 flex items-center gap-2"
          onClick={startCamera}
        ><Play size={20} /> Start Camera
        </button>

        <button className="border-amber-300 border px-3 py-2 rounded-lg cursor-pointer bg-amber-300 mb-5 flex items-center gap-2"
          onClick={stopCamera}
        ><Square size={20} /> Stop Camera
        </button>
      </div>

    </div>
  );
}
