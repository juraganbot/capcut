"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit2, Save, X, Tag, Percent, DollarSign, Calendar, ArrowLeft, ToggleLeft, ToggleRight } from "lucide-react";

interface Voucher {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minPurchase?: number;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  description?: string;
  createdAt: string;
}

export default function VouchersPage() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    maxDiscount: '',
    minPurchase: '',
    maxUses: '',
    validFrom: '',
    validUntil: '',
    description: '',
  });

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    if (auth !== "true") {
      router.push("/admin");
      return;
    }
    fetchVouchers();
  }, [router]);

  const fetchVouchers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/vouchers");
      const data = await response.json();
      if (data.success) {
        setVouchers(data.vouchers);
      }
    } catch (error) {
      console.error("Error fetching vouchers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.code || !formData.discountValue || !formData.validFrom || !formData.validUntil) {
      alert("Kode, nilai diskon, dan tanggal harus diisi!");
      return;
    }

    try {
      const response = await fetch("/api/admin/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
          minPurchase: formData.minPurchase ? Number(formData.minPurchase) : undefined,
          maxUses: formData.maxUses ? Number(formData.maxUses) : undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setFormData({
          code: '',
          discountType: 'percentage',
          discountValue: 0,
          maxDiscount: '',
          minPurchase: '',
          maxUses: '',
          validFrom: '',
          validUntil: '',
          description: '',
        });
        fetchVouchers();
      } else {
        alert(data.error || "Gagal menambah voucher");
      }
    } catch (error) {
      console.error("Error adding voucher:", error);
      alert("Terjadi kesalahan");
    }
  };

  const handleUpdate = async (id: string) => {
    const voucher = vouchers.find((v) => v._id === id);
    if (!voucher) return;

    try {
      const response = await fetch("/api/admin/vouchers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          code: voucher.code,
          discountType: voucher.discountType,
          discountValue: voucher.discountValue,
          maxDiscount: voucher.maxDiscount,
          minPurchase: voucher.minPurchase,
          maxUses: voucher.maxUses,
          isActive: voucher.isActive,
          validFrom: voucher.validFrom,
          validUntil: voucher.validUntil,
          description: voucher.description,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setEditingId(null);
        fetchVouchers();
      } else {
        alert(data.error || "Gagal update voucher");
      }
    } catch (error) {
      console.error("Error updating voucher:", error);
      alert("Terjadi kesalahan");
    }
  };

  const handleToggleActive = async (id: string) => {
    const voucher = vouchers.find((v) => v._id === id);
    if (!voucher) return;

    try {
      const response = await fetch("/api/admin/vouchers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          isActive: !voucher.isActive,
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchVouchers();
      } else {
        alert(data.error || "Gagal toggle status");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Terjadi kesalahan");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus voucher ini?")) return;

    try {
      const response = await fetch("/api/admin/vouchers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      if (data.success) {
        fetchVouchers();
      } else {
        alert(data.error || "Gagal hapus voucher");
      }
    } catch (error) {
      console.error("Error deleting voucher:", error);
      alert("Terjadi kesalahan");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-100 via-transparent to-transparent opacity-50"></div>
      
      <div className="relative container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <button
                onClick={() => router.push("/admin")}
                className="inline-flex items-center text-gray-700 hover:text-black mb-4 font-medium transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Dashboard
              </button>
              <h1 className="text-4xl font-black text-black mb-2">Kelola Voucher</h1>
              <p className="text-gray-600">Buat dan kelola kode voucher diskon</p>
            </div>
          </div>

          {/* ADD VOUCHER FORM */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Tambah Voucher Baru
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="code">Kode Voucher</Label>
                <Input
                  id="code"
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="DISKON50"
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="discountType">Tipe Diskon</Label>
                <select
                  id="discountType"
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                  className="w-full mt-2 p-2 border border-gray-300 rounded-lg"
                >
                  <option value="percentage">Persentase (%)</option>
                  <option value="fixed">Nominal (Rp)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="discountValue">
                  Nilai Diskon {formData.discountType === 'percentage' ? '(%)' : '(Rp)'}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                  placeholder={formData.discountType === 'percentage' ? '50' : '10000'}
                  className="mt-2"
                />
              </div>

              {formData.discountType === 'percentage' && (
                <div>
                  <Label htmlFor="maxDiscount">Maks Diskon (Rp) - Opsional</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="5000"
                    className="mt-2"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="minPurchase">Min Pembelian (Rp) - Opsional</Label>
                <Input
                  id="minPurchase"
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                  placeholder="0"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="maxUses">Maks Penggunaan - Opsional</Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  placeholder="Unlimited"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="validFrom">Berlaku Dari</Label>
                <Input
                  id="validFrom"
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="validUntil">Berlaku Sampai</Label>
                <Input
                  id="validUntil"
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="mb-4">
              <Label htmlFor="description">Deskripsi - Opsional</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Diskon spesial untuk pelanggan setia"
                className="mt-2"
              />
            </div>

            <Button onClick={handleAdd} className="w-full bg-black hover:bg-gray-900 text-white font-bold">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Voucher
            </Button>
          </div>

          {/* VOUCHERS LIST */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Daftar Voucher</h2>
              <div className="text-sm text-gray-600">
                Total: {vouchers.length} | Aktif: {vouchers.filter((v) => v.isActive).length}
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : vouchers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Belum ada voucher</div>
            ) : (
              <div className="space-y-3">
                {vouchers.map((voucher) => {
                  const isExpired = new Date(voucher.validUntil) < new Date();
                  const isMaxedOut = voucher.maxUses && voucher.usedCount >= voucher.maxUses;
                  
                  return (
                    <div
                      key={voucher._id}
                      className={`p-4 rounded-lg border-2 ${
                        !voucher.isActive || isExpired || isMaxedOut
                          ? "bg-gray-50 border-gray-300"
                          : "bg-green-50 border-green-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Tag className="w-5 h-5 text-gray-600" />
                            <h3 className="text-xl font-bold">{voucher.code}</h3>
                            {voucher.isActive && !isExpired && !isMaxedOut && (
                              <span className="px-2 py-1 bg-green-200 text-green-700 text-xs font-bold rounded-full">
                                Aktif
                              </span>
                            )}
                            {!voucher.isActive && (
                              <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">
                                Nonaktif
                              </span>
                            )}
                            {isExpired && (
                              <span className="px-2 py-1 bg-red-200 text-red-700 text-xs font-bold rounded-full">
                                Kadaluarsa
                              </span>
                            )}
                            {isMaxedOut && (
                              <span className="px-2 py-1 bg-orange-200 text-orange-700 text-xs font-bold rounded-full">
                                Kuota Habis
                              </span>
                            )}
                          </div>

                          <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Diskon: </span>
                              <span className="font-semibold">
                                {voucher.discountType === 'percentage' 
                                  ? `${voucher.discountValue}%` 
                                  : `Rp ${voucher.discountValue.toLocaleString('id-ID')}`}
                                {voucher.maxDiscount && voucher.discountType === 'percentage' && (
                                  <span className="text-gray-500"> (maks Rp {voucher.maxDiscount.toLocaleString('id-ID')})</span>
                                )}
                              </span>
                            </div>
                            
                            {voucher.minPurchase && voucher.minPurchase > 0 && (
                              <div>
                                <span className="text-gray-600">Min Pembelian: </span>
                                <span className="font-semibold">Rp {voucher.minPurchase.toLocaleString('id-ID')}</span>
                              </div>
                            )}

                            <div>
                              <span className="text-gray-600">Penggunaan: </span>
                              <span className="font-semibold">
                                {voucher.usedCount} {voucher.maxUses ? `/ ${voucher.maxUses}` : '/ ∞'}
                              </span>
                            </div>

                            <div>
                              <span className="text-gray-600">Berlaku: </span>
                              <span className="font-semibold">
                                {formatDate(voucher.validFrom)} - {formatDate(voucher.validUntil)}
                              </span>
                            </div>
                          </div>

                          {voucher.description && (
                            <p className="text-sm text-gray-600 mt-2 italic">{voucher.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleActive(voucher._id)}
                            className={`p-2 rounded-lg text-white ${
                              voucher.isActive
                                ? "bg-orange-600 hover:bg-orange-700"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                            title={voucher.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            {voucher.isActive ? (
                              <ToggleRight className="w-4 h-4" />
                            ) : (
                              <ToggleLeft className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(voucher._id)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
