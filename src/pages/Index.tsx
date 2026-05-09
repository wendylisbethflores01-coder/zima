import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import LatestProperties from "@/components/LatestProperties";
import CompanyInfo from "@/components/CompanyInfo";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <LatestProperties />
      <CompanyInfo />
      <Footer />
    </div>
  );
};

export default Index;
