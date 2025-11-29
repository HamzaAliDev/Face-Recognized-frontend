"use client";
import { useState, useRef } from "react";
import * as faceapi from "face-api.js";
import { Camera, HardDriveUpload, Trash2 } from "lucide-react";
import Link from "next/link";

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

  // Function to stop the camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const registerUser = async () => {
    if (!name.trim() || !email.trim() || images.length < 6 || images.length > 8) {
      setStatus("❌ Provide name, email & capture between 6 and 8 images");
      return;
    }

    setStatus("⏳ Registering user...");

    try {

      const resp = await fetch("http://localhost:3001/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, images }),
      });

      const data = await resp.json();

      if (data.ok) {
        setStatus("✅ User Registered Successfully!");
        setImages([]);


        //  Stop camera after success
        stopCamera();
      } else {
        setStatus("❌ " + data.error);
      }
    } catch (error) {
      setStatus("❌ Error registering user");

    }

  };


  return (
    <div className='max-w-[1300px] w-[80%] mx-auto flex flex-col items-center justify-center mt-10'>
      <div className='flex w-full justify-between items-center mb-10 '>
        <h1 className='text-2xl font-semibold '>User Registration</h1>
        <button className='border-green-400 border px-3 py-2 rounded-lg cursor-pointer bg-green-400'><Link href="/">Face Recognization</Link></button>
      </div>

      <div className='flex flex-wrap items-center justify-center gap-5 mb-6 w-full '>
        <input
          type="text"
          placeholder="Full Name"
          className="border border-gray-300 rounded-md px-3 py-2 w-80"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="border border-gray-300 rounded-md px-3 py-2 w-80"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>


      <div className="flex items-center justify-center gap-7">
        <button className="border-cyan-500 border px-3 py-2 rounded-lg cursor-pointer bg-cyan-500 mb-5"
          onClick={startCamera}
        >Start Camera
        </button>

        <button className="border-red-600 border px-3 py-2 rounded-lg cursor-pointer bg-red-600 mb-5"
          onClick={stopCamera}
        >Stop Camera
        </button>
      </div>


      <div className="shadow-lg border border-gray-400 rounded-md mb-5">
        <video
          ref={videoRef}
          width={400}
          height={300}
        ></video>
      </div>

      <p className="text-lg font-semibold mb-5">status: {status}</p>

      <div className="flex items-center justify-center gap-7">
        <button className="border-amber-300 border px-3 py-2 rounded-lg cursor-pointer bg-amber-300 mb-5 flex items-center gap-2"
          onClick={captureImage}
        ><Camera size={20} /> Capture Face</button>

        <button className="border-green-600 border px-3 py-2 rounded-lg cursor-pointer bg-green-600 mb-5 flex items-center gap-2"
          onClick={registerUser}
        ><HardDriveUpload size={20} /> Register User</button>

      </div>


      <div className="flex flex-wrap gap-4 ">
        {images.map((img, i) => (
          <div key={i} className="img-wrapper">
            <img
              src={img}
              width={80}
              height={80}
              className="rounded-md border"
            />
            <div
              className="delete-btn cursor-pointer justify-center items-center flex"
              onClick={() => {
                const updated = images.filter((_, index) => index !== i);
                setImages(updated);
                setStatus(`Captured ${updated.length} images`);
              }}
            >
              <Trash2 size={20} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
