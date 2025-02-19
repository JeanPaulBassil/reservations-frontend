import React from "react";
import LoginForm from "./LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | KLYO ASO",
  description: "Access your KLYO ASO account and manage your app optimization.",
  keywords: [
    "Login",
    "KLYO ASO",
    "App Store Optimization",
    "ASO Platform",
    "Mobile Growth",
  ],
  alternates: {
    canonical: "https://klyoaso.com/login", // 🔥 Prevent duplicate content issues
  },
  robots: {
    index: false, // 🔥 Prevents Google from indexing the login page
    follow: false,
  },
  openGraph: {
    title: "Login to KLYO ASO",
    description: "Sign in to access AI-powered App Store Optimization tools.",
    url: "https://klyoaso.com/login",
    siteName: "KLYO ASO",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KLYO ASO Login Page",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function LoginPage() {
  return (
    <div
      className="flex h-screen w-full items-center justify-end overflow-hidden bg-content1 p-2 sm:p-4 lg:p-8"
      style={{
        backgroundImage: "url(/images/auth/loginBg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute left-10 top-10">
        <div className="flex items-center">
          <p className="font-medium text-white">KLYO ASO</p>
        </div>
      </div>

      <div className="absolute bottom-10 left-10 hidden md:block">
        <p className="max-w-xl text-white/60">
          <span className="font-medium">"</span>
          Take control of your app's success with AI-powered optimization. Track
          performance, refine strategies, and stay ahead in the competitive app
          marketplace.
          <span className="font-medium">"</span>
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
