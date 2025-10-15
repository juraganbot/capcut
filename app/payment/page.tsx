"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, Copy, ArrowLeft, Smartphone, Clock, Loader2, X } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import Image from "next/image";

export default function PaymentPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [formData, setFormData] = useState({ email: "", phone: "" });
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [baseAmount, setBaseAmount] = useState(20000);
  const [uniqueAmount, setUniqueAmount] = useState(20000);
  const [autoCheckCount, setAutoCheckCount] = useState(0);
  const [maxAutoChecks] = useState(24);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    const savedPayment = localStorage.getItem("paymentSession");
    if (savedPayment) {
      try {
        const parsed = JSON.parse(savedPayment);
        const now = Date.now();
        const expiresAt = new Date(parsed.expiredAt).getTime();
        
        if (now < expiresAt) {
          console.log('=== RESTORING SESSION ===');
          console.log('Order ID:', parsed.orderId);
          console.log('Unique Amount:', parsed.uniqueAmount);
          
          setOrderId(parsed.orderId);
          setQrCodeDataUrl(parsed.qrCodeDataUrl);
          setBaseAmount(parsed.baseAmount);
          setUniqueAmount(parsed.uniqueAmount);
          
          const timeLeftSeconds = Math.floor((expiresAt - now) / 1000);
          setTimeLeft(timeLeftSeconds);
          setIsLoading(false);
          
          console.log('=== SESSION RESTORED ===');
          return;
        } else {
          localStorage.removeItem("paymentSession");
        }
      } catch (error) {
        console.error("Error loading payment session:", error);
        localStorage.removeItem("paymentSession");
      }
    }

    createPaymentOrder();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          localStorage.removeItem("paymentSession");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const createPaymentOrder = async () => {
    try {
      const savedData = localStorage.getItem("checkoutData");
      const data = savedData ? JSON.parse(savedData) : {};

      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email || '',
          phone: data.phone || '',
          voucherCode: data.voucher?.code || '',
        }),
      });

      const result = await response.json();

      if (response.status === 429) {
        const waitTime = result.resetAt ? Math.ceil((result.resetAt - Date.now()) / 1000) : 60;
        setErrorMessage(`⏳ ${result.error || 'Terlalu banyak request. Coba lagi dalam ' + waitTime + ' detik.'}`);
        setTimeout(() => setErrorMessage(null), 10000);
        setIsLoading(false);
        return;
      }

      if (result.success) {
        setQrCodeDataUrl(result.qrCodeDataUrl);
        setOrderId(result.orderId);
        setBaseAmount(result.baseAmount);
        setUniqueAmount(result.uniqueAmount);
        setErrorMessage(null);

        const paymentSession = {
          orderId: result.orderId,
          qrCodeDataUrl: result.qrCodeDataUrl,
          baseAmount: result.baseAmount,
          uniqueAmount: result.uniqueAmount,
          expiredAt: result.expiredAt,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem("paymentSession", JSON.stringify(paymentSession));
      } else {
        setErrorMessage(`❌ ${result.error || 'Gagal membuat order. Silakan coba lagi.'}`);
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      setErrorMessage('❌ Terjadi kesalahan. Silakan refresh halaman.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-check payment status every 5 seconds for 2 minutes
  useEffect(() => {
    if (!orderId || isLoading) return;

    const checkPayment = async () => {
      if (autoCheckCount >= maxAutoChecks) {
        console.log('Auto-check stopped: max attempts reached');
        return;
      }

      try {
        const response = await fetch('/api/payment/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId, amount: uniqueAmount }),
        });

        const result = await response.json();

        if (result.success && result.status === 'paid') {
          router.push(`/success?orderId=${orderId}`);
        } else {
          setAutoCheckCount(prev => prev + 1);
        }
      } catch (error) {
        console.error('Auto-check error:', error);
        setAutoCheckCount(prev => prev + 1);
      }
    };

    // Start auto-check after 5 seconds
    const interval = setInterval(checkPayment, 5000);

    // Cleanup on unmount or when max checks reached
    return () => {
      clearInterval(interval);
    };
  }, [orderId, isLoading, autoCheckCount, maxAutoChecks, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(uniqueAmount.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = async () => {
    if (!orderId) {
      alert('Order ID tidak ditemukan');
      return;
    }

    setIsChecking(true);

    try {
      const response = await fetch('/api/payment/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, amount: uniqueAmount }),
      });

      const result = await response.json();

      if (result.success) {
        if (result.status === 'paid') {
          router.push(`/success?orderId=${orderId}`);
        } else {
          alert('Pembayaran belum terdeteksi. Silakan coba lagi setelah melakukan pembayaran.');
        }
      } else {
        alert('Gagal mengecek status pembayaran');
      }
    } catch (error) {
      console.error('Error checking payment:', error);
      alert('Terjadi kesalahan saat mengecek pembayaran');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-gray-950 transition-colors duration-150">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-100 via-transparent to-transparent dark:from-gray-950 opacity-50"></div>
      
      {/* ANIMATED THEME TOGGLE */}
      <AnimatedThemeToggler duration={500} />
      
      <div className="relative container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          
          <button
            onClick={() => router.back()}
            className={`inline-flex items-center text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white mb-6 font-medium transition-all duration-150 cursor-pointer ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </button>

          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 animate-in fade-in slide-in-from-top-2 transition-all duration-150">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">Error</p>
                  <p className="text-sm text-red-800 dark:text-red-300">{errorMessage}</p>
                </div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="flex-shrink-0 p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-all duration-150 cursor-pointer"
                >
                  <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>
          )}

          <div className={`text-center mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="inline-flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                Selesaikan dalam {formatTime(timeLeft)}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-black dark:text-white mb-3 tracking-tight">
              Bayar Sekarang
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
              Scan QRIS untuk melanjutkan
            </p>
          </div>

          <div className={`bg-white dark:bg-gray-950 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-900 mb-8 transition-all duration-150 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Smartphone className="w-5 h-5 text-black dark:text-white" />
              <h2 className="text-xl font-bold text-black dark:text-white">
                Scan QR Code QRIS
              </h2>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 mb-6 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-800 transition-all duration-150">
              <div className="text-center">
                {isLoading ? (
                  <div className="w-64 h-64 bg-white dark:bg-black rounded-xl shadow-lg flex items-center justify-center mb-4 border border-gray-200 dark:border-gray-800 transition-all duration-150">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 text-gray-400 dark:text-gray-600 animate-spin mx-auto mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Generating QR Code...</p>
                    </div>
                  </div>
                ) : errorMessage ? (
                  <div className="w-64 h-64 bg-white rounded-xl shadow-lg flex items-center justify-center mb-4 border border-gray-200">
                    <div className="text-center px-4">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <X className="w-6 h-6 text-red-600" />
                      </div>
                      <p className="text-sm text-red-600 font-medium mb-2">Gagal memuat QR Code</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="text-xs text-blue-600 hover:text-blue-700 underline cursor-pointer"
                      >
                        Refresh halaman
                      </button>
                    </div>
                  </div>
                ) : qrCodeDataUrl ? (
                  <div className="w-64 h-64 bg-white rounded-xl shadow-lg flex items-center justify-center mb-4 border border-gray-200 p-4">
                    <Image
                      src={qrCodeDataUrl}
                      alt="QRIS QR Code"
                      width={256}
                      height={256}
                      className="w-full h-full object-contain"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-64 h-64 bg-white rounded-xl shadow-lg flex items-center justify-center mb-4 border border-gray-200">
                    <p className="text-sm text-gray-600">Memuat QR Code...</p>
                  </div>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400">QR Code QRIS</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {["GoPay", "OVO", "DANA", "ShopeePay", "LinkAja"].map((wallet) => (
                <span key={wallet} className="text-xs bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-medium transition-all duration-150">
                  {wallet}
                </span>
              ))}
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mt-6 transition-all duration-150">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">Total Pembayaran</p>
              <div className="flex items-center justify-center gap-3 mb-2">
                <p className="text-4xl md:text-5xl font-black text-black dark:text-white">
                  Rp {uniqueAmount.toLocaleString('id-ID')}
                </p>
                <button
                  onClick={handleCopy}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-all duration-150 cursor-pointer"
                  title="Copy jumlah"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-sm text-green-600 dark:text-green-400 text-center animate-in fade-in">
                  ✓ Jumlah berhasil dicopy
                </p>
              )}
            </div>
          </div>

          <div className={`bg-white dark:bg-gray-950 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-900 mb-8 transition-all duration-150 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-xl font-bold text-center mb-5 text-black dark:text-white">
              Cara Bayar:
            </h2>
            <div className="space-y-3">
              {[
                "Buka aplikasi e-wallet kamu (GoPay, OVO, DANA, dll)",
                "Pilih menu Scan QR atau QRIS",
                "Scan QR code di atas",
                `Pastikan jumlah Rp ${uniqueAmount.toLocaleString('id-ID')} (nominal unik)`,
                "Konfirmasi pembayaran - sistem akan otomatis mendeteksi"
              ].map((step, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg transition-all duration-150">
                  <div className="flex-shrink-0 w-6 h-6 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{step}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 transition-all duration-150">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-yellow-900">!</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-yellow-900 dark:text-yellow-300 mb-1">
                    Nominal Unik: Rp {uniqueAmount.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-yellow-800 dark:text-yellow-400">
                    Bayar sesuai nominal ini agar pembayaran otomatis terdeteksi
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-400">
                    <span className="font-semibold">Rincian:</span>
                    <span>Rp {baseAmount.toLocaleString('id-ID')} + Rp {(uniqueAmount - baseAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Button
              onClick={handleConfirmPayment}
              disabled={isChecking || !orderId}
              size="lg"
              className="w-full bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-100 text-white dark:text-black text-lg py-6 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-150 hover:scale-[1.02] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Mengecek Pembayaran...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Sudah Bayar? Klik Disini
                </>
              )}
            </Button>
            
            {autoCheckCount > 0 && autoCheckCount < maxAutoChecks && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />
                <p className="text-sm text-blue-900">
                  Mengecek pembayaran otomatis... ({autoCheckCount}/{maxAutoChecks})
                </p>
              </div>
            )}
            
            {autoCheckCount >= maxAutoChecks && (
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-700 text-center">
                  Auto-check selesai. Klik tombol "Sudah Bayar" untuk cek manual.
                </p>
              </div>
            )}
          </div>

          {/* CONTACT INFO */}
          {(formData.email || formData.phone) && (
            <div className={`bg-gray-100 border border-gray-300 rounded-xl p-4 mt-6 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <p className="text-sm font-semibold text-gray-900 mb-2">Detail akun akan dikirim ke:</p>
              {formData.email && (
                <p className="text-sm text-gray-700">📧 {formData.email}</p>
              )}
              {formData.phone && (
                <p className="text-sm text-gray-700">📱 {formData.phone}</p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
