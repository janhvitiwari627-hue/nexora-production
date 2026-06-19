export const revenueTrend = Array.from({ length: 30 }, (_, i) => ({
  label: `D${i + 1}`,
  revenue: 8000 + Math.round(Math.sin(i / 3) * 2500 + Math.random() * 3500 + i * 220),
}));

export const revenueByCategory = [
  { name: "Hair", value: 145000, color: "hsl(243, 75%, 59%)" },
  { name: "Skin & Facial", value: 92000, color: "hsl(280, 70%, 60%)" },
  { name: "Nails", value: 48000, color: "hsl(330, 75%, 60%)" },
  { name: "Spa & Massage", value: 78000, color: "hsl(190, 75%, 50%)" },
  { name: "Bridal", value: 64000, color: "hsl(40, 90%, 55%)" },
];

export const bookingsTrend = Array.from({ length: 14 }, (_, i) => ({
  label: `D${i + 1}`,
  bookings: 18 + Math.round(Math.cos(i / 2) * 6 + Math.random() * 8),
}));

export const customerTrend = Array.from({ length: 12 }, (_, i) => ({
  label: `W${i + 1}`,
  new: 12 + Math.round(Math.random() * 18),
  returning: 28 + Math.round(Math.random() * 24),
}));

export const staffPerformance = [
  { name: "Anjali Rao", bookings: 64, revenue: 182400, rating: 4.9, top: "Hair Color" },
  { name: "Rahul Mehta", bookings: 52, revenue: 148200, rating: 4.7, top: "Beard Styling" },
  { name: "Sneha Iyer", bookings: 48, revenue: 132800, rating: 4.8, top: "Facial Glow" },
  { name: "Vikram Singh", bookings: 41, revenue: 121500, rating: 4.6, top: "Hair Spa" },
  { name: "Pooja Nair", bookings: 38, revenue: 108600, rating: 4.8, top: "Bridal Makeup" },
];

export const servicePerformance = [
  { name: "Hair Color + Cut", bookings: 84, revenue: 168000, rating: 4.8 },
  { name: "Facial Glow", bookings: 72, revenue: 108000, rating: 4.7 },
  { name: "Hair Spa", bookings: 65, revenue: 81250, rating: 4.6 },
  { name: "Bridal Makeup", bookings: 18, revenue: 162000, rating: 4.9 },
  { name: "Manicure + Pedicure", bookings: 58, revenue: 52200, rating: 4.5 },
  { name: "Beard Styling", bookings: 92, revenue: 64400, rating: 4.7 },
];

// 7 days × 24 hours peak heatmap
export const peakHours: number[][] = Array.from({ length: 7 }, (_, d) =>
  Array.from({ length: 24 }, (_, h) => {
    if (h < 9 || h > 21) return Math.random() * 0.1;
    const peak = h >= 11 && h <= 13 ? 0.8 : h >= 17 && h <= 20 ? 1 : 0.5;
    const weekendBoost = d === 0 || d === 6 ? 0.2 : 0;
    return Math.min(1, peak + weekendBoost + (Math.random() * 0.2 - 0.1));
  }),
);

export const funnel = [
  { label: "Profile Views", value: 12480 },
  { label: "Service Page Views", value: 6240 },
  { label: "Booking Initiated", value: 1820 },
  { label: "Booking Completed", value: 942 },
];

export const kpiTiles = [
  { label: "Total Revenue", value: "₹4,27,000", delta: "+18.2%", positive: true },
  { label: "Avg Ticket Size", value: "₹1,840", delta: "+6.4%", positive: true },
  { label: "Total Bookings", value: "232", delta: "+12.1%", positive: true },
  { label: "Repeat Rate", value: "64%", delta: "+3.8%", positive: true },
];

export const rateMeters = [
  { label: "Completion Rate", value: 86, color: "hsl(142, 71%, 45%)" },
  { label: "Cancellation Rate", value: 8, color: "hsl(0, 72%, 55%)" },
  { label: "Reschedule Rate", value: 6, color: "hsl(38, 92%, 50%)" },
];
