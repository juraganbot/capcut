"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, Mail, MessageCircle, Sparkles, Copy, Loader2, X, Play, Youtube } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({ email: "", phone: "" });
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [credential, setCredential] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderNotFound, setOrderNotFound] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const tutorials = [
    {
      id: 'tutorial-1',
      title: 'Cara Login CapCut Pro',
      description: 'Tutorial lengkap cara login ke akun CapCut Pro',
      videoId: 'dQw4w9WgXcQ', // Ganti dengan YouTube video ID yang sesuai
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    },
    {
      id: 'tutorial-2',
      title: 'Fitur Premium CapCut',
      description: 'Kenalan dengan semua fitur premium CapCut Pro',
      videoId: 'dQw4w9WgXcQ', // Ganti dengan YouTube video ID yang sesuai
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    },
    {
      id: 'tutorial-3',
      title: 'Tips & Trik Editing',
      description: 'Tips editing video profesional dengan CapCut',
      videoId: 'dQw4w9WgXcQ', // Ganti dengan YouTube video ID yang sesuai
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    },
  ];

  useEffect(() => {
    setIsVisible(true);
    
    const savedData = localStorage.getItem("checkoutData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }

    const orderId = searchParams.get('orderId');
    if (orderId) {
      fetchCredential(orderId);
    } else {
      setOrderNotFound(true);
      setIsLoading(false);
    }
  }, [searchParams]);

  const fetchCredential = async (orderId: string) => {
    try {
      const response = await fetch(`/api/order/${orderId}`);
      const data = await response.json();
      
      if (data.success && data.credential) {
        setCredential(data.credential);
      } else {
        setOrderNotFound(true);
      }
    } catch (error) {
      console.error('Error fetching credential:', error);
      setOrderNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyEmail = () => {
    const email = credential?.email || "capcut.pro@example.com";
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPassword = () => {
    const password = credential?.password || "CapCut2024Pro";
    navigator.clipboard.writeText(password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-gray-950 flex items-center justify-center transition-colors duration-150">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-black dark:text-white animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (orderNotFound) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-gray-950 flex items-center justify-center p-4 transition-colors duration-150">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-950 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-900 text-center transition-all duration-150">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl font-black text-black dark:text-white mb-3">Order Tidak Ditemukan</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Order ID tidak valid atau belum melakukan pembayaran. Silakan cek kembali atau lakukan checkout ulang.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/")}
                className="w-full bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-100 text-white dark:text-black font-bold py-6 rounded-xl transition-all duration-150"
              >
                Kembali ke Beranda
              </Button>
              <Button
                onClick={() => router.push("/payment")}
                variant="outline"
                className="w-full border-2 border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white font-bold py-6 rounded-xl transition-all duration-150"
              >
                Cek Status Pembayaran
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayEmail = credential?.email || "capcut.pro@example.com";
  const displayPassword = credential?.password || "CapCut2024Pro";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-gray-950 transition-colors duration-150">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-100 via-transparent to-transparent dark:from-gray-950 opacity-50"></div>
      
      {/* ANIMATED THEME TOGGLE */}
      <AnimatedThemeToggler duration={500} />
      
      <div className="relative container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          
          {/* SUCCESS ANIMATION */}
          <div className={`text-center mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
            <div className="inline-flex items-center justify-center w-24 h-24 bg-black dark:bg-white rounded-full mb-6 animate-in zoom-in duration-500">
              <Check className="w-12 h-12 text-white dark:text-black" strokeWidth={3} />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-black dark:text-white mb-3 tracking-tight">
              Pembayaran Berhasil!
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
              Akun CapCut Pro kamu udah aktif
            </p>
          </div>

          {/* ACCOUNT CREDENTIALS */}
          <div className={`bg-gradient-to-br from-gray-900 via-black to-gray-800 dark:from-black dark:via-gray-950 dark:to-black text-white rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-700 dark:border-gray-900 mb-6 transition-all duration-150 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5" />
              <p className="font-bold text-lg">Detail Akun Kamu</p>
            </div>

            <div className="space-y-4">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-sm text-gray-300 mb-2">Email</p>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-mono text-white break-all">{displayEmail}</p>
                  <button
                    onClick={handleCopyEmail}
                    className="flex-shrink-0 p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedEmail ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-300" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-sm text-gray-300 mb-2">Password</p>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-mono text-white">{displayPassword}</p>
                  <button
                    onClick={handleCopyPassword}
                    className="flex-shrink-0 p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedPassword ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-sm text-gray-300">
                💡 <span className="font-semibold">Tips:</span> Simpan email & password ini dengan aman. Jangan share ke orang lain!
              </p>
            </div>
          </div>

          {/* NEXT STEPS */}
          <div className={`bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 mb-6 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-xl font-bold text-center mb-5 text-black">
              Langkah Selanjutnya
            </h2>
            <div className="space-y-4">
              {[
                {
                  num: "1",
                  title: "Buka CapCut",
                  desc: "Buka aplikasi CapCut di HP atau laptop kamu"
                },
                {
                  num: "2",
                  title: "Login",
                  desc: "Masuk dengan email & password yang udah dikasih"
                },
                {
                  num: "3",
                  title: "Nikmati Premium",
                  desc: "Semua fitur premium udah bisa langsung dipakai!"
                }
              ].map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                    {step.num}
                  </div>
                  <div>
                    <p className="font-bold text-base text-gray-900 mb-1">{step.title}</p>
                    <p className="text-sm text-gray-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VIDEO TUTORIALS */}
          <div className={`bg-white dark:bg-gray-950 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-900 mb-6 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2 mb-5">
              <Youtube className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-black dark:text-white">Video Tutorial</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Tonton tutorial berikut untuk memaksimalkan penggunaan CapCut Pro kamu
            </p>
            
            <div className="space-y-4">
              {tutorials.map((tutorial, index) => (
                <div key={tutorial.id} className="bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-150">
                  {activeVideo === tutorial.id ? (
                    <div className="relative" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${tutorial.videoId}?autoplay=1`}
                        title={tutorial.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div 
                      className="relative cursor-pointer group"
                      onClick={() => setActiveVideo(tutorial.id)}
                    >
                      <div className="relative" style={{ paddingBottom: '56.25%' }}>
                        <img
                          src={tutorial.thumbnail}
                          alt={tutorial.title}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center">
                          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <Play className="w-8 h-8 text-white ml-1" fill="white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">{tutorial.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{tutorial.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NOTIFICATION INFO */}
          {(formData.email || formData.phone) && (
            <div className={`bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-xl p-5 mb-6 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-black dark:text-white flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Detail akun juga udah dikirim ke:
                  </p>
                  {formData.email && (
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">{formData.email}</p>
                    </div>
                  )}
                  {formData.phone && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">{formData.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SUPPORT */}
          <div className={`bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 mb-6 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Butuh bantuan?
            </p>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
              Kalau ada masalah atau pertanyaan, hubungi kami via WhatsApp
            </p>
            <Button
              onClick={() => window.open("https://wa.me/6281234567890", "_blank")}
              variant="outline"
              className="w-full border-2 border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-all duration-150"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Chat WhatsApp Support
            </Button>
          </div>

          {/* BACK TO HOME */}
          <div className={`transition-all duration-700 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Button
              onClick={() => router.push("/")}
              size="lg"
              className="w-full bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-100 text-white dark:text-black text-lg py-6 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-150 hover:scale-[1.02] cursor-pointer"
            >
              Kembali ke Beranda
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600 dark:text-gray-400" />
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
