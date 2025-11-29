"use client";
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
const CameraCapture = dynamic(() => import('../components/CameraCapture'), { ssr: false });

export default function Home() {
  return (
    <>
      <Head>
        <title>Face Recognization — Demo</title>
        <meta name="description" content="Face Recognization Demo Application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='max-w-[1300px] w-[80%] mx-auto flex flex-col items-center justify-center mt-10'>
        <div className='flex w-full justify-between items-center mb-10 '>
          <h1 className='text-2xl font-semibold '>Face Recognization — Demo</h1>
          <button className='border-green-400 border px-3 py-2 rounded-lg cursor-pointer bg-green-400'><Link href="/register">Register User</Link></button>
        </div>

        <CameraCapture />
      </main>
    </>
  );
}
