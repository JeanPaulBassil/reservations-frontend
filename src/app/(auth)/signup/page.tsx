import React from "react";
import SignUpForm from "./SignUpForm";
import { Metadata } from "next";
import Image from 'next/image';

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your KLYO ASO account and start optimizing your apps.",
  keywords: [
    "Sign Up",
    "KLYO ASO",
    "App Store Optimization",
    "ASO Platform",
    "Mobile Growth",
  ],
  alternates: {
    canonical: "https://klyoaso.com/signup",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Sign Up for KLYO ASO",
    description: "Create an account to access AI-powered App Store Optimization tools.",
    url: "https://klyoaso.com/signup",
    siteName: "KLYO ASO",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KLYO ASO Sign Up Page",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function SignUpPage() {
  return (
    <div className="flex h-screen w-full items-center justify-start overflow-hidden bg-content1 p-2 sm:p-4 lg:p-8 relative">
      <Image
        src="/images/auth/signupBg.png"
        alt="Sign up background"
        fill
        priority
        className="object-cover z-0"
      />
      
      <div className="absolute left-10 top-10 z-10">
        <div className="flex items-center">
          <p className="font-medium text-white">KLYO ASO</p>
        </div>
      </div>

      <div className="absolute bottom-10 left-10 hidden md:block z-10">
        <p className="max-w-xl text-white/70 leading-relaxed">
          <span className="font-medium">"</span>
          Join thousands of app developers and marketers who are leveraging AI to
          optimize their app store presence and drive sustainable growth.
          <span className="font-medium">"</span>
        </p>
      </div>

      <div className="z-10 w-full max-w-md">
        <SignUpForm />
      </div>
    </div>
  );
}

