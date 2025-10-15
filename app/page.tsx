"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Sparkles, Clock, Shield, Smartphone, Monitor, Star, Bell, X, Tag, Loader2, Mail, MessageCircle, Instagram, Facebook, Twitter, History, Package, ChevronRight, BadgeCheck, TrendingUp, Users, Zap, ChevronDown } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { testimonials } from "@/lib/testimonials";

export default function Home() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [priceAnimated, setPriceAnimated] = useState(false);
  const [normalPriceVisible, setNormalPriceVisible] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: ""
  });
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherData, setVoucherData] = useState<any>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [basePrice, setBasePrice] = useState(20000);
  const [normalPrice, setNormalPrice] = useState(149000);
  const [discountAmount, setDiscountAmount] = useState(129000);
  const [discountPercentage, setDiscountPercentage] = useState(87);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [liveCounter, setLiveCounter] = useState(1247);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Apakah akun CapCut Pro ini legal?",
      answer: "Ya, 100% legal! Kami menyediakan akun premium resmi yang dibeli langsung dari CapCut. Akun bersifat private dan hanya untuk kamu."
    },
    {
      question: "Berapa lama akun aktif?",
      answer: "Akun aktif selama 1 bulan penuh (30 hari) sejak tanggal aktivasi. Kamu bisa perpanjang lagi setelah masa aktif habis."
    },
    {
      question: "Apakah bisa dipakai di semua device?",
      answer: "Bisa! Akun bisa digunakan di Android, iOS, dan PC/Laptop. Kamu bisa login di maksimal 2 device secara bersamaan."
    },
    {
      question: "Bagaimana cara aktivasi setelah bayar?",
      answer: "Setelah pembayaran berhasil, kamu akan langsung dapat email & password. Tinggal login di aplikasi CapCut dengan kredensial tersebut."
    },
    {
      question: "Apakah ada garansi?",
      answer: "Ya! Kami berikan garansi full 1 bulan. Jika ada masalah dengan akun, kami akan ganti dengan akun baru tanpa biaya tambahan."
    },
    {
      question: "Metode pembayaran apa saja yang tersedia?",
      answer: "Kami terima pembayaran via QRIS yang bisa dibayar dengan semua e-wallet: GoPay, OVO, DANA, ShopeePay, LinkAja, dan lainnya."
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    setTimeout(() => setNormalPriceVisible(true), 300);
    setTimeout(() => setPriceAnimated(true), 800);
    
    const savedData = localStorage.getItem("checkoutData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
        if (parsed.email || parsed.phone) {
          setShowNotification(true);
        }
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }

    // Fetch prices from API
    fetch('/api/settings/prices')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.prices) {
          setBasePrice(data.prices.basePrice);
          setNormalPrice(data.prices.normalPrice);
          setDiscountAmount(data.prices.discountAmount);
          setDiscountPercentage(data.prices.discountPercentage);
        }
      })
      .catch(err => console.error('Error fetching prices:', err));

    fetch('/api/session/init', { method: 'POST' }).catch(err => {
      console.error('Session init failed:', err);
    });

    // Check if user has order history
    checkOrderHistory();

    // Auto-scroll testimonials
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonialIndex((prev) => {
        const next = prev + 1;
        return next >= testimonials.length ? 0 : next;
      });
    }, 3000); // Every 3 seconds

    // Live counter animation
    const counterInterval = setInterval(() => {
      setLiveCounter(prev => prev + Math.floor(Math.random() * 3));
    }, 5000); // Update every 5 seconds

    return () => {
      clearInterval(testimonialInterval);
      clearInterval(counterInterval);
    };
  }, []);

  useEffect(() => {
    const container = document.getElementById('testimonial-scroll');
    if (container) {
      const cardWidth = 320 + 16; // card width + gap
      container.scrollTo({
        left: currentTestimonialIndex * cardWidth,
        behavior: 'smooth'
      });
    }
  }, [currentTestimonialIndex]);

  const checkOrderHistory = async () => {
    const savedData = localStorage.getItem("checkoutData");
    if (!savedData) return;

    try {
      const parsed = JSON.parse(savedData);
      if (!parsed.email && !parsed.phone) return;

      const response = await fetch('/api/orders/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: parsed.email || '',
          phone: parsed.phone || '',
        }),
      });

      const data = await response.json();
      if (data.success && data.orders.length > 0) {
        setOrderHistory(data.orders);
      }
    } catch (error) {
      console.error('Error checking order history:', error);
    }
  };

  const loadOrderHistory = async () => {
    if (!formData.email && !formData.phone) {
      alert('Masukkan email atau WhatsApp terlebih dahulu');
      return;
    }

    setIsLoadingHistory(true);
    try {
      const response = await fetch('/api/orders/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email || '',
          phone: formData.phone || '',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setOrderHistory(data.orders);
        setShowOrderHistory(true);
      } else {
        alert('Tidak ada riwayat pembelian ditemukan');
      }
    } catch (error) {
      console.error('Error loading order history:', error);
      alert('Gagal memuat riwayat pembelian');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (formData.email || formData.phone) {
      localStorage.setItem("checkoutData", JSON.stringify(formData));
    }
  }, [formData]);

  const handleNewCheckout = () => {
    // Clear voucher for new checkout
    setVoucherData(null);
    setVoucherCode('');
    setVoucherError(null);
    
    // Save current data
    const dataToSave = {
      email: formData.email,
      phone: formData.phone,
      voucher: null,
    };
    localStorage.setItem("checkoutData", JSON.stringify(dataToSave));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Clear old session for new checkout
    handleNewCheckout();
    
    const checkoutData = {
      ...formData,
      voucher: voucherData ? {
        code: voucherData.voucher.code,
        discount: voucherData.discount,
        finalAmount: voucherData.finalAmount,
      } : null,
      timestamp: Date.now(), // Add timestamp for new checkout
    };
    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    
    // Clear payment session for new checkout
    localStorage.removeItem("paymentSession");
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    router.push("/payment");
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      paid: { text: 'Berhasil', class: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700' },
      pending: { text: 'Menunggu', class: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700' },
      expired: { text: 'Kadaluarsa', class: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700' },
      cancelled: { text: 'Dibatalkan', class: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700' },
    };
    const badge = badges[status] || badges.pending;
    return <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${badge.class}`}>{badge.text}</span>;
  };

  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError("Masukkan kode voucher");
      return;
    }

    setIsValidatingVoucher(true);
    setVoucherError(null);

    try {
      const response = await fetch('/api/voucher/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: voucherCode, 
          amount: basePrice 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setVoucherData(data);
        setVoucherError(null);
      } else {
        setVoucherError(data.error || 'Kode voucher tidak valid');
        setVoucherData(null);
      }
    } catch (error) {
      console.error('Error validating voucher:', error);
      setVoucherError('Gagal memvalidasi voucher');
      setVoucherData(null);
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode("");
    setVoucherData(null);
    setVoucherError(null);
  };

  const Divider = () => (
    <div className="flex items-center gap-4 my-8">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-gray-950 transition-colors duration-150">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-100 via-transparent to-transparent dark:from-gray-950 opacity-50"></div>
      
      {/* ANIMATED THEME TOGGLE */}
      <AnimatedThemeToggler duration={500} />
      
      <div className="relative container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          
          {/* HERO SECTION */}
          <div className={`text-center mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Promo Terbatas
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-black dark:text-white mb-3 tracking-tight">
              CapCut Pro
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
              Edit video seperti profesional
            </p>
          </div>

          {/* PRICE CARD */}
          <div className={`mb-8 transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 dark:from-black dark:via-gray-950 dark:to-black text-white p-8 md:p-12 rounded-3xl overflow-hidden group shadow-2xl border border-gray-700 dark:border-gray-900 transition-all duration-150">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24 group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-left">
                    <p className="text-gray-400 text-sm mb-1">Harga biasanya</p>
                    <div className={`transition-all duration-500 ${normalPriceVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                      <p className="text-2xl md:text-3xl font-bold line-through text-gray-500">
                        Rp {normalPrice.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className={`bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all duration-500 ${normalPriceVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-45'}`}>
                    <span className="animate-pulse">-{discountPercentage}%</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-6">
                  <p className="text-gray-300 text-sm mb-2">Cuma bayar</p>
                  <div className={`transition-all duration-700 ${priceAnimated ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-4'}`}>
                    <p className="text-5xl md:text-7xl font-black mb-2 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent animate-pulse">
                      Rp {basePrice.toLocaleString('id-ID')}
                    </p>
                    <p className="text-gray-400 text-sm">buat 1 bulan full akses</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Divider />

          {/* BENEFITS SECTION */}
          <div className={`mb-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-white dark:bg-gray-950 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-900 transition-all duration-150">
              <h2 className="text-xl font-bold text-center mb-5 text-black dark:text-white flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Yang kamu dapetin
              </h2>
              <div className="space-y-3">
                {[
                  "Akun Private & Legal",
                  "Gak bakal kelogout sendiri",
                  "Durasi 1 Bulan",
                  "Full Garansi"
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 hover:translate-x-1 cursor-pointer delay-[${300 + index * 50}ms] ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-black dark:bg-white rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white dark:text-black" strokeWidth={3} />
                    </div>
                    <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Divider />

          {/* DEVICE COMPATIBILITY */}
          <div className={`bg-white dark:bg-gray-950 rounded-2xl p-6 border border-gray-200 dark:border-gray-900 shadow-lg mb-8 transition-all duration-150 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Bisa dipakai di semua device:
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center group hover:scale-105 transition-transform cursor-pointer">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-2 group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-all duration-150">
                  <Smartphone className="w-8 h-8 mx-auto text-gray-700 dark:text-gray-300" />
                </div>
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">Android</p>
              </div>
              <div className="text-center group hover:scale-105 transition-transform cursor-pointer">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-2 group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-all duration-150">
                  <Smartphone className="w-8 h-8 mx-auto text-gray-700 dark:text-gray-300" />
                </div>
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">iOS</p>
              </div>
              <div className="text-center group hover:scale-105 transition-transform cursor-pointer">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-2 group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-all duration-150">
                  <Monitor className="w-8 h-8 mx-auto text-gray-700 dark:text-gray-300" />
                </div>
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">Laptop/PC</p>
              </div>
            </div>
          </div>

          <Divider />

          {/* ORDER HISTORY BUTTON */}
          {orderHistory.length > 0 && (
            <div className={`mb-6 transition-all duration-1000 delay-350 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <button
                onClick={() => setShowOrderHistory(!showOrderHistory)}
                className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 dark:hover:from-blue-900/30 hover:to-indigo-100 dark:hover:to-indigo-900/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 transition-all duration-150 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 dark:bg-blue-600 rounded-lg">
                      <History className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-base text-blue-900 dark:text-blue-300">Riwayat Pembelian</p>
                      <p className="text-sm text-blue-700 dark:text-blue-400">{orderHistory.length} transaksi ditemukan</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-blue-600 dark:text-blue-400 transition-transform duration-200 ${showOrderHistory ? 'rotate-90' : ''}`} />
                </div>
              </button>
            </div>
          )}

          {/* ORDER HISTORY LIST */}
          {showOrderHistory && orderHistory.length > 0 && (
            <div className="bg-white dark:bg-gray-950 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-900 mb-8 transition-all duration-150">
              <h3 className="text-xl font-bold mb-4 text-black dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5" />
                Riwayat Pembelian Kamu
              </h3>
              <div className="space-y-3">
                {orderHistory.map((order) => (
                  <div key={order._id} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-150">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">{order.orderId}</p>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleString('id-ID', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Total Bayar</p>
                        <p className="text-base font-bold text-gray-900 dark:text-white">
                          Rp {order.finalAmount.toLocaleString('id-ID')}
                        </p>
                      </div>
                      {order.voucherCode && (
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Voucher</p>
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {order.voucherCode}
                          </p>
                        </div>
                      )}
                    </div>

                    {order.status === 'paid' && (
                      <Button
                        onClick={() => router.push(`/success?orderId=${order.orderId}`)}
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-150"
                      >
                        Lihat Detail Akun
                      </Button>
                    )}
                    {order.status === 'pending' && (
                      <Button
                        onClick={() => router.push(`/payment`)}
                        size="sm"
                        variant="outline"
                        className="w-full border-2 border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold transition-all duration-150"
                      >
                        Lanjutkan Pembayaran
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHECKOUT SECTION */}
          <div className={`bg-white dark:bg-gray-950 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-900 mb-8 transition-all duration-150 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <form onSubmit={handleSubmit} className="space-y-5">
              {!showNotification ? (
                <button
                  type="button"
                  onClick={() => setShowNotification(true)}
                  className="w-full bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-700 rounded-xl p-5 transition-all duration-150 flex items-center justify-center gap-3 group cursor-pointer"
                >
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors" />
                  <span className="text-base font-semibold text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors">
                    Saya mau Notifikasi
                  </span>
                </button>
              ) : (
                <div className="space-y-4 bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotification(false);
                      setFormData({ email: "", phone: "" });
                    }}
                    className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <p className="font-bold text-base text-center mb-4 dark:text-white">Isi buat nerima notifikasi</p>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-semibold dark:text-gray-200">
                      Email <span className="text-gray-400 dark:text-gray-500 font-normal text-sm">(Opsional)</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@contoh.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-12 text-base border-gray-300 dark:border-gray-800 dark:bg-black dark:text-white focus:border-black dark:focus:border-gray-600 focus:ring-black dark:focus:ring-gray-600 transition-all duration-150"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base font-semibold dark:text-gray-200">
                      WhatsApp <span className="text-gray-400 dark:text-gray-500 font-normal text-sm">(Opsional)</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-12 text-base border-gray-300 dark:border-gray-800 dark:bg-black dark:text-white focus:border-black dark:focus:border-gray-600 focus:ring-black dark:focus:ring-gray-600 transition-all duration-150"
                    />
                  </div>

                  {(formData.email || formData.phone) && (
                    <div className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg p-3 flex items-center gap-2 transition-all duration-150">
                      <Check className="w-5 h-5 text-black dark:text-white flex-shrink-0" />
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Tersimpan otomatis ✓</p>
                    </div>
                  )}
                </div>
              )}

              {/* VOUCHER INPUT */}
              {!voucherData ? (
                <div className="bg-white dark:bg-gray-950 rounded-xl p-5 border border-gray-200 dark:border-gray-900 shadow-sm transition-all duration-150">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <Tag className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">Punya Kode Voucher?</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Masukkan kode voucher"
                        value={voucherCode}
                        onChange={(e) => {
                          setVoucherCode(e.target.value.toUpperCase());
                          setVoucherError(null);
                        }}
                        className="flex-1 h-12 text-base font-mono font-semibold uppercase border-gray-300 dark:border-gray-800 dark:bg-black dark:text-white focus:border-orange-500 focus:ring-orange-500 transition-all duration-150"
                      />
                      <Button
                        type="button"
                        onClick={handleValidateVoucher}
                        disabled={isValidatingVoucher || !voucherCode.trim()}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-8 h-12 font-bold cursor-pointer disabled:opacity-50"
                      >
                        {isValidatingVoucher ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "Pakai"
                        )}
                      </Button>
                    </div>
                    {voucherError && (
                      <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex-shrink-0 w-5 h-5 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center mt-0.5">
                          <X className="w-3 h-3 text-white" />
                        </div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-300">{voucherError}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-4 border-2 border-green-300 dark:border-green-700 shadow-sm animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </div>
                        <p className="font-bold text-green-800 dark:text-green-300">Voucher Diterapkan!</p>
                      </div>
                      <div className="ml-8">
                        <p className="text-base text-gray-900 dark:text-white font-bold mb-1">{voucherData.voucher.code}</p>
                        {voucherData.voucher.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{voucherData.voucher.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      className="flex-shrink-0 p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer group"
                      title="Hapus voucher"
                    >
                      <X className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-400" />
                    </button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-green-800 dark:text-green-300">Potongan Harga</span>
                      <span className="text-xl font-black text-green-700 dark:text-green-400">
                        - Rp {voucherData.discount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 transition-all duration-150">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600 dark:text-gray-400">Harga normal</span>
                  <span className="line-through text-gray-400 dark:text-gray-500">Rp {normalPrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600 dark:text-gray-400">Diskon</span>
                  <span className="text-gray-900 dark:text-gray-100 font-semibold">-Rp {discountAmount.toLocaleString('id-ID')}</span>
                </div>
                {voucherData && (
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-green-600 dark:text-green-400 font-semibold">Voucher ({voucherData.voucher.code})</span>
                    <span className="text-green-600 dark:text-green-400 font-bold">-Rp {voucherData.discount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 dark:border-gray-600 pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold dark:text-white">Total bayar</span>
                  <span className="text-2xl font-black dark:text-white">
                    Rp {voucherData ? voucherData.finalAmount.toLocaleString('id-ID') : basePrice.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-black hover:bg-gray-900 text-white text-lg md:text-xl py-6 md:py-7 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-5 h-5" />
                      Checkout Sekarang
                      <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                    </>
                  )}
                </span>
              </Button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Aman & terenkripsi • Aktivasi instant setelah bayar
              </p>
            </form>
          </div>

          <Divider />

          {/* TESTIMONIALS SECTION */}
          <div className={`bg-white dark:bg-gray-950 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-900 shadow-lg mb-8 transition-all duration-150 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-2xl font-bold text-center mb-2 text-black dark:text-white">
              Kata mereka yang udah pakai
            </h2>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-2">
              {testimonials.length}+ customer puas dengan layanan kami
            </p>
            <p className="text-center text-xs text-gray-500 dark:text-gray-500 mb-6 flex items-center justify-center gap-1">
              <BadgeCheck className="w-3 h-3" />
              Testimoni verified dari customer asli
            </p>
            
            {/* Horizontal Scroll Container */}
            <div className="relative -mx-6 md:-mx-8">
              <div id="testimonial-scroll" className="overflow-x-auto scrollbar-hide px-6 md:px-8">
                <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-150 hover:shadow-md cursor-pointer flex-shrink-0"
                      style={{ width: '320px' }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex gap-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        {testimonial.verified && (
                          <BadgeCheck className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed line-clamp-4">
                        "{testimonial.text}"
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          {testimonial.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {testimonial.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Scroll Indicator */}
              <div className="absolute bottom-0 right-0 bg-gradient-to-l from-white dark:from-gray-950 via-white dark:via-gray-950 to-transparent w-20 h-full pointer-events-none"></div>
            </div>
            
            <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-4">
              💡 Auto-scroll setiap 3 detik • Swipe untuk kontrol manual
            </p>
          </div>

          <Divider />

          {/* LIVE STATS */}
          <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800 mb-8 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300">Live Statistics</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-2xl font-black text-blue-900 dark:text-blue-300">{liveCounter.toLocaleString()}</p>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-400">Customer Aktif</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <p className="text-2xl font-black text-green-900 dark:text-green-300">98%</p>
                </div>
                <p className="text-xs text-green-700 dark:text-green-400">Satisfaction Rate</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <p className="text-2xl font-black text-orange-900 dark:text-orange-300">&lt;5min</p>
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-400">Avg. Activation</p>
              </div>
            </div>
          </div>

          {/* FAQ SECTION */}
          <div className={`bg-white dark:bg-gray-950 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-900 shadow-lg mb-8 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-2xl font-bold text-center mb-2 text-black dark:text-white">
              Pertanyaan yang Sering Ditanyakan
            </h2>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
              Punya pertanyaan? Cek jawabannya di sini
            </p>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-150"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-4 pb-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed animate-in fade-in slide-in-from-top-2">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* TRUST BADGES */}
          <div className={`transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white dark:bg-gray-950 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-900 hover:border-gray-300 dark:hover:border-gray-800 transition-all duration-150 hover:shadow-md cursor-pointer group">
                <Clock className="w-6 h-6 mx-auto mb-2 text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors" />
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">Aktivasi Instant</p>
              </div>
              <div className="bg-white dark:bg-gray-950 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-900 hover:border-gray-300 dark:hover:border-gray-800 transition-all duration-150 hover:shadow-md cursor-pointer group">
                <Shield className="w-6 h-6 mx-auto mb-2 text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors" />
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">100% Aman</p>
              </div>
              <div className="bg-white dark:bg-gray-950 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-900 hover:border-gray-300 dark:hover:border-gray-800 transition-all duration-150 hover:shadow-md cursor-pointer group">
                <Check className="w-6 h-6 mx-auto mb-2 text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors" />
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">Garansi Aktif</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="relative bg-gradient-to-b from-gray-900 to-black dark:from-black dark:to-gray-950 text-white py-12 border-t border-gray-800 dark:border-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              
              {/* ABOUT */}
              <div>
                <h3 className="text-lg font-bold mb-4">CapCut Pro</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Layanan berlangganan CapCut Pro terpercaya dengan harga terjangkau. Akun private, legal, dan bergaransi.
                </p>
              </div>

              {/* PAYMENT */}
              <div>
                <h3 className="text-lg font-bold mb-4">Metode Pembayaran</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Smartphone className="w-4 h-4" />
                    <span>QRIS (Semua E-Wallet)</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {["GoPay", "OVO", "DANA", "ShopeePay", "LinkAja"].map((wallet) => (
                      <span key={wallet} className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">
                        {wallet}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* INFO */}
              <div>
                <h3 className="text-lg font-bold mb-4">Informasi</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Aktivasi Instant</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>100% Aman & Legal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Garansi Full 1 Bulan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <span>Support 24/7</span>
                  </li>
                </ul>
              </div>

              {/* CONTACT */}
              <div>
                <h3 className="text-lg font-bold mb-4">Hubungi Kami</h3>
                <div className="space-y-3">
                  <a href="mailto:support@capcutpro.com" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <Mail className="w-4 h-4" />
                    <span>support@capcutpro.com</span>
                  </a>
                  <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Support</span>
                  </a>
                  
                  <div className="pt-3">
                    <p className="text-xs text-gray-500 mb-2">Follow Us:</p>
                    <div className="flex gap-3">
                      <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                        <Instagram className="w-4 h-4" />
                      </a>
                      <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                        <Facebook className="w-4 h-4" />
                      </a>
                      <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                        <Twitter className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                <p>&copy; 2025 CapCut Pro. All rights reserved.</p>
                <div className="flex gap-4">
                  <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                  <a href="#" className="hover:text-white transition-colors">Refund Policy</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
