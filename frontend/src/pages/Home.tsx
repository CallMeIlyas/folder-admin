import Hero from '../components/home/Hero';
import BestSelling from '../components/home/BestSelling';
import OrderSteps from '../components/home/OrderSteps';
import GallerySection from '../components/home/GallerySection';
import Footer from '../components/home/Footer';

const Home = () => {
  return (
    <div className="font-['Montserrat'] bg-white">
      <Hero />
      <BestSelling />
      <OrderSteps />
      <GallerySection />
      <Footer />
    </div>
  );
};

export default Home;