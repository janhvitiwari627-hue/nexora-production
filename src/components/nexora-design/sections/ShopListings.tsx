import { useState } from "react";
import { Star, MapPin, BadgeCheck, Heart } from "lucide-react";
import FadeIn from "../components/FadeIn";

const shops = [
  {
    id: 1,
    name: "The Glam House",
    image: "https://images.pexels.com/photos/7195802/pexels-photo-7195802.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=800",
    rating: 4.9,
    reviews: 324,
    distance: "1.2 km",
    services: "Haircut, Facial, Spa",
    price: "₹499",
    verified: true,
  },
  {
    id: 2,
    name: "Royal Wellness Spa",
    image: "https://images.pexels.com/photos/7031704/pexels-photo-7031704.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=800",
    rating: 4.8,
    reviews: 186,
    distance: "2.5 km",
    services: "Massage, Therapy, Facial",
    price: "₹899",
    verified: true,
  },
  {
    id: 3,
    name: "Ink Culture Studio",
    image: "https://images.pexels.com/photos/28991646/pexels-photo-28991646.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=800",
    rating: 4.7,
    reviews: 112,
    distance: "3.1 km",
    services: "Tattoo, Piercing, Design",
    price: "₹1,499",
    verified: true,
  },
  {
    id: 4,
    name: "Nouveau Nail Bar",
    image: "https://images.pexels.com/photos/7755224/pexels-photo-7755224.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=800",
    rating: 4.9,
    reviews: 245,
    distance: "0.9 km",
    services: "Nail Art, Manicure, Pedicure",
    price: "₹399",
    verified: true,
  },
  {
    id: 5,
    name: "Bridal Glow by Priya",
    image: "https://images.pexels.com/photos/13779727/pexels-photo-13779727.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=800",
    rating: 5.0,
    reviews: 89,
    distance: "4.0 km",
    services: "Bridal Makeup, Hairstyling",
    price: "₹4,999",
    verified: true,
  },
  {
    id: 6,
    name: "Urban Mane Salon",
    image: "https://images.pexels.com/photos/7195800/pexels-photo-7195800.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=800",
    rating: 4.6,
    reviews: 512,
    distance: "1.8 km",
    services: "Haircut, Beard, Grooming",
    price: "₹349",
    verified: false,
  },
];

export default function ShopListings() {
  const [saved, setSaved] = useState<number[]>([]);

  const toggleSave = (id: number) => {
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Trending Near You
              </h2>
              <p className="mt-3 text-lg text-slate-500">
                Handpicked salons & studios trusted by thousands.
              </p>
            </div>
            <a
              href="#"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all →
            </a>
          </div>
        </FadeIn>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop, i) => (
            <FadeIn key={shop.id} delay={i * 0.08}>
              <div className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={shop.image}
                    alt={shop.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <button
                    onClick={() => toggleSave(shop.id)}
                    className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-600 shadow-sm backdrop-blur-sm transition-colors hover:text-rose-500"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        saved.includes(shop.id)
                          ? "fill-rose-500 text-rose-500"
                          : ""
                      }`}
                    />
                  </button>
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-slate-900 shadow-sm backdrop-blur-sm">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {shop.rating}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {shop.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {shop.distance}
                        </span>
                        <span>{shop.reviews} reviews</span>
                      </div>
                    </div>
                    {shop.verified && (
                      <BadgeCheck className="h-5 w-5 shrink-0 text-indigo-600" />
                    )}
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{shop.services}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-slate-900">
                        {shop.price}
                      </span>
                      <span className="text-xs text-slate-400"> onwards</span>
                    </div>
                    <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
