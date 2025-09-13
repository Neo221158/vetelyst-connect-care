import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Stethoscope, 
  UserCheck, 
  Send, 
  Eye, 
  FileText, 
  MessageCircle,
  ArrowRight
} from "lucide-react";

const UserTypes = () => {
  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Built for
            <span className="text-primary"> Both Sides</span>
            of Veterinary Care
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you're a general practitioner referring cases or a specialist 
            providing consultations, Vetelyst is designed for your specific workflow.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Referring Veterinarians */}
          <Card className="p-8 bg-gradient-card border-0 shadow-card">
            <div className="flex items-center mb-6">
              <div className="bg-primary/10 p-3 rounded-lg mr-4">
                <Stethoscope className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  Referring Veterinarians
                </h3>
                <p className="text-muted-foreground">
                  General practice professionals
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <Send className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">Submit Cases Easily</h4>
                  <p className="text-muted-foreground text-sm">
                    Use structured forms to submit cases with all relevant patient information and medical history.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">Upload Documents</h4>
                  <p className="text-muted-foreground text-sm">
                    Securely share X-rays, lab results, and other medical files with specialists.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MessageCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">Real-time Communication</h4>
                  <p className="text-muted-foreground text-sm">
                    Communicate directly with specialists and receive timely responses and recommendations.
                  </p>
                </div>
              </div>
            </div>

            <Button className="w-full" size="lg">
              Get Started as Referring Vet
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>

          {/* Veterinary Specialists */}
          <Card className="p-8 bg-gradient-card border-0 shadow-card">
            <div className="flex items-center mb-6">
              <div className="bg-secondary/10 p-3 rounded-lg mr-4">
                <UserCheck className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  Veterinary Specialists
                </h3>
                <p className="text-muted-foreground">
                  Board-certified experts
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <Eye className="h-5 w-5 text-secondary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">Review Cases Efficiently</h4>
                  <p className="text-muted-foreground text-sm">
                    Access organized case information with all relevant documents in one secure location.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MessageCircle className="h-5 w-5 text-secondary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">Provide Expert Consultation</h4>
                  <p className="text-muted-foreground text-sm">
                    Share professional insights and recommendations through our secure communication system.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-secondary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">Generate Professional Reports</h4>
                  <p className="text-muted-foreground text-sm">
                    Create standardized PDF reports with recommendations and treatment plans.
                  </p>
                </div>
              </div>
            </div>

            <Button variant="secondary" className="w-full" size="lg">
              Join as Specialist
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default UserTypes;