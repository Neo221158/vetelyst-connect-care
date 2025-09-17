import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Clock, Users } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Seamless Veterinary
              <span className="block text-secondary"> Collaboration</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Connect general practice veterinarians with specialists through our secure, 
              HIPAA-compliant platform. Streamline case referrals, improve patient outcomes, 
              and enhance professional collaboration.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 border-white/20 text-white hover:bg-white/20">
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-6 text-center lg:text-left">
              <div className="flex flex-col items-center lg:items-start">
                <Shield className="h-8 w-8 text-secondary mb-2" />
                <span className="text-sm text-white/80">HIPAA Compliant</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <Clock className="h-8 w-8 text-secondary mb-2" />
                <span className="text-sm text-white/80">24/7 Access</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <Users className="h-8 w-8 text-secondary mb-2" />
                <span className="text-sm text-white/80">1000+ Specialists</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src={heroImage}
                alt="Veterinary professionals collaborating on Vetelyst platform"
                className="w-full h-auto rounded-2xl shadow-elevated"
              />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;