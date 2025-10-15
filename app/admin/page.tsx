"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit2, Save, X, Eye, EyeOff, Shield, LogOut, Upload, CheckCircle, XCircle, Tag, Percent, DollarSign, Calendar, TrendingUp, Users, Award } from "lucide-react";

interface Credential {
  _id: string;
  email: string;
  password: string;
  status: 'available' | 'used' | 'expired' | 'invalid';
  usedBy?: string;
  usedAt?: string;
  createdAt: string;
}

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

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [bulkText, setBulkText] = useState("");
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [activeTab, setActiveTab] = useState<'credentials' | 'vouchers'>('credentials');
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [voucherFormData, setVoucherFormData] = useState({
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
  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);
  const [voucherStats, setVoucherStats] = useState<any>(null);
  const [showVoucherStats, setShowVoucherStats] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    if (auth === "true") {
      setIsAuthenticated(true);
      fetchCredentials();
      fetchVouchers();
      fetchVoucherStats();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || adminPassword === "admin123") {
      setIsAuthenticated(true);
      localStorage.setItem("adminAuth", "true");
      fetchCredentials();
    } else {
      alert("Password salah!");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminAuth");
    setAdminPassword("");
  };

  const fetchCredentials = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/credentials");
      const data = await response.json();
      if (data.success) {
        setCredentials(data.credentials);
      }
    } catch (error) {
      console.error("Error fetching credentials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVouchers = async () => {
    try {
      const response = await fetch("/api/admin/vouchers");
      const data = await response.json();
      if (data.success) {
        setVouchers(data.vouchers);
      }
    } catch (error) {
      console.error("Error fetching vouchers:", error);
    }
  };

  const fetchVoucherStats = async () => {
    try {
      const response = await fetch("/api/admin/vouchers/stats");
      const data = await response.json();
      if (data.success) {
        setVoucherStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching voucher stats:", error);
    }
  };

  const handleAdd = async () => {
    if (!formData.email || !formData.password) {
      alert("Email dan password harus diisi!");
      return;
    }

    try {
      const response = await fetch("/api/admin/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setFormData({ email: "", password: "" });
        fetchCredentials();
      } else {
        alert(data.error || "Gagal menambah credential");
      }
    } catch (error) {
      console.error("Error adding credential:", error);
      alert("Terjadi kesalahan");
    }
  };

  const handleBulkImport = async () => {
    if (!bulkText.trim()) {
      alert("Masukkan data untuk import!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bulkText }),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        if (data.results.errors.length > 0) {
          console.log("Errors:", data.results.errors);
        }
        setBulkText("");
        setShowBulkImport(false);
        fetchCredentials();
      } else {
        alert(data.error || "Gagal import credentials");
      }
    } catch (error) {
      console.error("Error bulk importing:", error);
      alert("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await fetch("/api/admin/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, toggleStatus: true }),
      });

      const data = await response.json();
      if (data.success) {
        fetchCredentials();
      } else {
        alert(data.error || "Gagal toggle status");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Terjadi kesalahan");
    }
  };

  const handleUpdate = async (id: string) => {
    const credential = credentials.find((c) => c._id === id);
    if (!credential) return;

    try {
      const response = await fetch("/api/admin/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, email: credential.email, password: credential.password }),
      });

      const data = await response.json();
      if (data.success) {
        setEditingId(null);
        fetchCredentials();
      } else {
        alert(data.error || "Gagal update credential");
      }
    } catch (error) {
      console.error("Error updating credential:", error);
      alert("Terjadi kesalahan");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus credential ini?")) return;

    try {
      const response = await fetch("/api/admin/credentials", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      if (data.success) {
        fetchCredentials();
      } else {
        alert(data.error || "Gagal hapus credential");
      }
    } catch (error) {
      console.error("Error deleting credential:", error);
      alert("Terjadi kesalahan");
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-black rounded-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-center mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 text-center mb-6">Masukkan password untuk akses</p>
            
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <Label htmlFor="password">Password Admin</Label>
                <Input
                  id="password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="mt-2"
                />
              </div>
              <Button type="submit" className="w-full bg-black hover:bg-gray-900 text-white font-bold py-6">
                Login
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-100 via-transparent to-transparent opacity-50"></div>
      
      <div className="relative container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-black text-black mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Kelola akun CapCut Pro & Voucher</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => window.location.href = '/admin/settings'}
                variant="outline"
                className="flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Pengaturan Harga
              </Button>
              <Button
                onClick={() => window.location.href = '/admin/vouchers'}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Tag className="w-4 h-4" />
                Kelola Voucher
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* VOUCHER STATISTICS */}
          {voucherStats && (
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 shadow-lg border-2 border-orange-200 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  Statistik Penggunaan Voucher
                </h2>
                <Button
                  onClick={() => setShowVoucherStats(!showVoucherStats)}
                  variant="outline"
                  size="sm"
                  className="text-sm"
                >
                  {showVoucherStats ? 'Sembunyikan' : 'Lihat Detail'}
                </Button>
              </div>

              {/* SUMMARY CARDS */}
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Tag className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Penggunaan</p>
                      <p className="text-2xl font-black text-gray-900">{voucherStats.totalVoucherUsage}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Diskon Diberikan</p>
                      <p className="text-2xl font-black text-green-700">
                        Rp {voucherStats.totalDiscountGiven.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Voucher Unik Digunakan</p>
                      <p className="text-2xl font-black text-gray-900">{voucherStats.uniqueVouchersUsed}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* DETAILED BREAKDOWN */}
              {showVoucherStats && voucherStats.voucherBreakdown.length > 0 && (
                <div className="bg-white rounded-xl p-4 border border-orange-200">
                  <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Detail Penggunaan per Voucher
                  </h3>
                  <div className="space-y-3">
                    {voucherStats.voucherBreakdown.map((voucher: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg font-black text-gray-900">{voucher.code}</span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                #{index + 1}
                              </span>
                            </div>
                            {voucher.voucherDetails?.description && (
                              <p className="text-sm text-gray-600">{voucher.voucherDetails.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-orange-600">{voucher.usageCount}x</p>
                            <p className="text-xs text-gray-500">digunakan</p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3 mb-3">
                          <div className="bg-white rounded-lg p-2 border border-gray-200">
                            <p className="text-xs text-gray-600">Total Diskon Diberikan</p>
                            <p className="text-base font-bold text-green-700">
                              Rp {voucher.totalDiscount.toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-2 border border-gray-200">
                            <p className="text-xs text-gray-600">Rata-rata Diskon</p>
                            <p className="text-base font-bold text-gray-900">
                              Rp {Math.round(voucher.totalDiscount / voucher.usageCount).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>

                        {/* CUSTOMER LIST */}
                        <details className="group">
                          <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-black flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Lihat {voucher.customers.length} Customer
                          </summary>
                          <div className="mt-3 space-y-2 pl-6">
                            {voucher.customers.map((customer: any, idx: number) => (
                              <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200 text-sm">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    {customer.email && (
                                      <p className="font-semibold text-gray-900">📧 {customer.email}</p>
                                    )}
                                    {customer.phone && (
                                      <p className="text-gray-600">📱 {customer.phone}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(customer.paidAt).toLocaleString('id-ID')}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-green-700">
                                      -Rp {customer.discount.toLocaleString('id-ID')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {voucherStats.voucherBreakdown.length === 0 && (
                <div className="bg-white rounded-xl p-8 border border-orange-200 text-center">
                  <Tag className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600">Belum ada voucher yang digunakan</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Tambah Credential
              </h2>
              <Button
                onClick={() => setShowBulkImport(!showBulkImport)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {showBulkImport ? "Form Tunggal" : "Bulk Import"}
              </Button>
            </div>

            {showBulkImport ? (
              <div>
                <Label htmlFor="bulkText">Bulk Import (Format: email | password)</Label>
                <Textarea
                  id="bulkText"
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`tiwuwa@orag.waroengpt.com | onova123\nxurowu@exoh.waroengpt.com | onova123\navazam@avom.waroengpt.com | onova123\nisosag@cula.waroengpt.com | onova123`}
                  className="mt-2 min-h-[200px] font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Format: 1 baris = 1 akun. Pisahkan email dan password dengan | (pipe)
                </p>
                <Button
                  onClick={handleBulkImport}
                  disabled={isLoading}
                  className="w-full mt-4 bg-black hover:bg-gray-900 text-white font-bold"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isLoading ? "Importing..." : "Import Semua"}
                </Button>
              </div>
            ) : (
              <div>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="text"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="password123"
                      className="mt-2"
                    />
                  </div>
                </div>
                <Button onClick={handleAdd} className="w-full bg-black hover:bg-gray-900 text-white font-bold">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Credential
                </Button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Daftar Credentials</h2>
              <div className="text-sm text-gray-600">
                Total: {credentials.length} | Tersedia: {credentials.filter((c) => c.status === 'available').length} | Terjual: {credentials.filter((c) => c.status === 'used').length}
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : credentials.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Belum ada credential</div>
            ) : (
              <div className="space-y-3">
                {credentials.map((credential) => (
                  <div
                    key={credential._id}
                    className={`p-4 rounded-lg border-2 ${
                      credential.status === 'used' ? "bg-red-50 border-red-300" : "bg-green-50 border-green-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-600">Email</Label>
                          {editingId === credential._id ? (
                            <Input
                              value={credential.email}
                              onChange={(e) => {
                                const updated = credentials.map((c) =>
                                  c._id === credential._id ? { ...c, email: e.target.value } : c
                                );
                                setCredentials(updated);
                              }}
                              className="mt-1"
                            />
                          ) : (
                            <p className="font-medium text-sm mt-1">{credential.email}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Password</Label>
                          <div className="flex items-center gap-2 mt-1">
                            {editingId === credential._id ? (
                              <Input
                                value={credential.password}
                                onChange={(e) => {
                                  const updated = credentials.map((c) =>
                                    c._id === credential._id ? { ...c, password: e.target.value } : c
                                  );
                                  setCredentials(updated);
                                }}
                              />
                            ) : (
                              <>
                                <p className="font-medium text-sm flex-1">
                                  {showPassword[credential._id] ? credential.password : "••••••••"}
                                </p>
                                <button
                                  onClick={() => togglePasswordVisibility(credential._id)}
                                  className="p-1 hover:bg-gray-200 rounded"
                                >
                                  {showPassword[credential._id] ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {editingId === credential._id ? (
                          <>
                            <button
                              onClick={() => handleUpdate(credential._id)}
                              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                              title="Simpan"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                fetchCredentials();
                              }}
                              className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                              title="Batal"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleToggleStatus(credential._id)}
                              className={`p-2 rounded-lg text-white ${
                                credential.status === 'available'
                                  ? "bg-orange-600 hover:bg-orange-700"
                                  : "bg-green-600 hover:bg-green-700"
                              }`}
                              title={credential.status === 'available' ? 'Tandai Terjual' : 'Tandai Tersedia'}
                            >
                              {credential.status === 'available' ? (
                                <XCircle className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => setEditingId(credential._id)}
                              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                              disabled={credential.status === 'used'}
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(credential._id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {credential.status === 'used' && credential.usedBy && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <div className="grid md:grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>
                            <span className="font-semibold">Digunakan oleh:</span> {credential.usedBy}
                          </div>
                          <div>
                            <span className="font-semibold">Waktu:</span>{" "}
                            {credential.usedAt ? new Date(credential.usedAt).toLocaleString("id-ID") : "-"}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          credential.status === 'used'
                            ? "bg-red-200 text-red-700"
                            : "bg-green-200 text-green-700"
                        }`}
                      >
                        {credential.status === 'used' ? "🔴 Terjual" : "🟢 Tersedia"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
