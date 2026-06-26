import Header from "@/components/nexora-design/sections/Header";
import Hero from "@/components/nexora-design/sections/Hero";
import SmartSearch from "@/components/nexora-design/sections/SmartSearch";
import Categories from "@/components/nexora-design/sections/Categories";
import ShopListings from "@/components/nexora-design/sections/ShopListings";
import Membership from "@/components/nexora-design/sections/Membership";
import Offers from "@/components/nexora-design/sections/Offers";
import AppDownload from "@/components/nexora-design/sections/AppDownload";
import WhiteLabelBuilder from "@/components/nexora-design/sections/WhiteLabelBuilder";
import ShopOwnerDashboard from "@/components/nexora-design/sections/ShopOwnerDashboard";
import AdminPanel from "@/components/nexora-design/sections/AdminPanel";
import SponsoredBrands from "@/components/nexora-design/sections/SponsoredBrands";
import SponsoredVideos from "@/components/nexora-design/sections/SponsoredVideos";
import Footer from "@/components/nexora-design/sections/Footer";

export function HomePage() {
  return (
    <div className="min-h-screen bg-[#F6F7F9] text-slate-900">
      <Header />
      <main>
        <Hero />
        <SmartSearch />
        <Categories />
        <ShopListings />
        <SponsoredBrands />
        <SponsoredVideos />
        <Offers />
        <Membership />
        <AppDownload />
        <WhiteLabelBuilder />
        <ShopOwnerDashboard />
        <AdminPanel />
      </main>
      <Footer />
    </div>
  );
}
