"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, DollarSign, Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [basePrice, setBasePrice] = useState("20000");
  const [normalPrice, setNormalPrice] = useState("149000");
  const [discountAmount, setDiscountAmount] = useState("129000");

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    if (auth !== "true") {
      router.push("/admin");
      return;
    }
    fetchSettings();
  }, [router]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();
      
      if (data.success && data.settings) {
        const settings = data.settings;
        const basePriceSetting = settings.find((s: any) => s.key === 'base_price');
        const normalPriceSetting = settings.find((s: any) => s.key === 'normal_price');
        const discountSetting = settings.find((s: any) => s.key === 'discount_amount');
        
        if (basePriceSetting) setBasePrice(basePriceSetting.value);
        if (normalPriceSetting) setNormalPrice(normalPriceSetting.value);
        if (discountSetting) setDiscountAmount(discountSetting.value);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!basePrice || !normalPrice || !discountAmount) {
      alert("Semua field harus diisi!");
      return;
    }

    const basePriceNum = parseInt(basePrice);
    const normalPriceNum = parseInt(normalPrice);
    const discountNum = parseInt(discountAmount);

    if (isNaN(basePriceNum) || isNaN(normalPriceNum) || isNaN(discountNum)) {
      alert("Harga harus berupa angka!");
      return;
    }

    if (basePriceNum <= 0 || normalPriceNum <= 0 || discountNum < 0) {
      alert("Harga harus lebih dari 0!");
      return;
    }

    setIsSaving(true);
    try {
      const promises = [
        fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: "base_price",
            value: basePrice,
            description: "Harga jual produk (setelah diskon)",
          }),
        }),
        fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: "normal_price",
            value: normalPrice,
            description: "Harga normal sebelum diskon",
          }),
        }),
        fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: "discount_amount",
            value: discountAmount,
            description: "Jumlah diskon",
          }),
        }),
      ];

      const results = await Promise.all(promises);
      const allSuccess = results.every(r => r.ok);

      if (allSuccess) {
        alert("✅ Pengaturan berhasil disimpan!");
        fetchSettings();
      } else {
        alert("❌ Gagal menyimpan pengaturan");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("❌ Terjadi kesalahan");
    } finally {
      setIsSaving(false);
    }
  };

  const calculateDiscount = () => {
    const normal = parseInt(normalPrice) || 0;
    const base = parseInt(basePrice) || 0;
    const discount = normal - base;
    setDiscountAmount(discount.toString());
  };

  const calculateDiscountPercentage = () => {
    const normal = parseInt(normalPrice) || 0;
    const discount = parseInt(discountAmount) || 0;
    if (normal === 0) return 0;
    return Math.round((discount / normal) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-100 via-transparent to-transparent opacity-50"></div>
      
      <div className="relative container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          
          <div className="mb-8">
            <button
              onClick={() => router.push("/admin")}
              className="inline-flex items-center text-gray-700 hover:text-black mb-4 font-medium transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Dashboard
            </button>
            <h1 className="text-4xl font-black text-black mb-2">Pengaturan Harga</h1>
            <p className="text-gray-600">Kelola harga produk CapCut Pro</p>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <>
              {/* PRICE SETTINGS */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pengaturan Harga
                </h2>
                
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="normalPrice" className="text-base font-semibold">
                      Harga Normal (Sebelum Diskon)
                    </Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                        Rp
                      </span>
                      <Input
                        id="normalPrice"
                        type="number"
                        value={normalPrice}
                        onChange={(e) => setNormalPrice(e.target.value)}
                        onBlur={calculateDiscount}
                        className="pl-12 h-12 text-lg font-bold"
                        placeholder="149000"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Harga yang dicoret di landing page</p>
                  </div>

                  <div>
                    <Label htmlFor="discountAmount" className="text-base font-semibold">
                      Jumlah Diskon
                    </Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                        Rp
                      </span>
                      <Input
                        id="discountAmount"
                        type="number"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(e.target.value)}
                        className="pl-12 h-12 text-lg font-bold"
                        placeholder="129000"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Potongan harga ({calculateDiscountPercentage()}% diskon)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="basePrice" className="text-base font-semibold">
                      Harga Jual (Setelah Diskon)
                    </Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                        Rp
                      </span>
                      <Input
                        id="basePrice"
                        type="number"
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                        className="pl-12 h-12 text-lg font-bold text-green-700"
                        placeholder="20000"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Harga yang dibayar customer</p>
                  </div>
                </div>
              </div>

              {/* PREVIEW */}
              <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-8 rounded-2xl mb-6 shadow-xl border border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Preview Harga</p>
                <div className="flex items-baseline gap-4 mb-4">
                  <p className="text-2xl font-bold line-through text-gray-500">
                    Rp {parseInt(normalPrice || "0").toLocaleString('id-ID')}
                  </p>
                  <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{calculateDiscountPercentage()}%
                  </div>
                </div>
                <p className="text-5xl font-black mb-2 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Rp {parseInt(basePrice || "0").toLocaleString('id-ID')}
                </p>
                <p className="text-gray-400 text-sm">untuk 1 bulan full akses</p>
              </div>

              {/* SAVE BUTTON */}
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-black hover:bg-gray-900 text-white text-lg py-6 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Simpan Pengaturan
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Perubahan akan langsung diterapkan di landing page
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
