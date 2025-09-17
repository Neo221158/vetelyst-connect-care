import { Card } from "@/components/ui/card";
import { 
  FileText, 
  Upload, 
  MessageSquare, 
  Download, 
  Shield, 
  Smartphone,
  Clock,
  Users,
  Search
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Structured Case Submission",
    description: "Submit cases with standardized forms ensuring all critical information is captured for specialist review."
  },
  {
    icon: Upload,
    title: "Secure Document Upload",
    description: "Upload X-rays, lab results, and medical files with enterprise-grade security and HIPAA compliance."
  },
  {
    icon: MessageSquare,
    title: "Professional Communication",
    description: "Real-time messaging system designed for veterinary professionals with case-specific threading."
  },
  {
    icon: Download,
    title: "PDF Report Generation",
    description: "Generate professional consultation reports and recommendations in standardized PDF format."
  },
  {
    icon: Shield,
    title: "HIPAA Compliant Security",
    description: "Bank-level encryption and security protocols ensure patient data protection and regulatory compliance."
  },
  {
    icon: Smartphone,
    title: "Mobile Responsive",
    description: "Access cases and communicate with specialists from any device, anywhere, anytime."
  },
  {
    icon: Clock,
    title: "Real-time Notifications",
    description: "Instant alerts for case updates, specialist responses, and urgent consultations."
  },
  {
    icon: Users,
    title: "Specialist Network",
    description: "Access to a vetted network of board-certified veterinary specialists across all disciplines."
  },
  {
    icon: Search,
    title: "Advanced Case Search",
    description: "Powerful search and filtering capabilities to quickly find cases, specialists, and historical data."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Everything You Need for
            <span className="text-primary"> Professional Collaboration</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive platform streamlines every aspect of veterinary case referrals 
            and specialist consultations, saving time and improving patient care.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-medical transition-all duration-300 bg-gradient-card border-0">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;