// Client-side config (safe to expose)

export const config = {
  // This will be replaced at build time with actual env value
  // For client-side, we'll fetch from API or use default
  defaultPaymentAmount: 20000,
};

// Helper to get display amount (without unique code)
export function getDisplayAmount(): number {
  return config.defaultPaymentAmount;
}
