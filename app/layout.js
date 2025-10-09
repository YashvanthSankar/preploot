import { Pixelify_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Header } from "@/components/header";
import RAGChatbot from "@/components/rag-chatbot";
import { Toaster } from "sonner";
import ParticleBackground from "@/components/particle-background";

const pixelify = Pixelify_Sans({
  variable: "--font-pixelify",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "PrepLoot - AI-Powered Learning Platform",
  description: "Master any competitive exam with AI-powered quizzes, gamification, and progress tracking. Learn from the best YouTube content with personalized questions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${pixelify.variable} antialiased bg-gradient-to-br from-background via-background to-primary/5`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ParticleBackground />
            <Header />
            {children}
            <RAGChatbot />
            <Toaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
