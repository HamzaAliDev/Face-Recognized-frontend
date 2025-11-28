"use client";
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
const CameraCapture = dynamic(() => import('../components/CameraCapture'), { ssr: false });

export default function Home() {
  return (
    <>
      <Head><title>Face Attendance — Demo</title></Head>
      <main style={{ padding: 20 }}>
        <Link href="/register"><button>Register User</button></Link>
        <h1>Face Attendance — Demo</h1>
        <CameraCapture />
      </main>
    </>
  );
}
