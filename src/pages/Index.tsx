import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, MessageSquare, Users, Lock, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-24 sm:py-32">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="p-4 rounded-2xl gradient-primary shadow-2xl">
                <Shield className="w-12 h-12 text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold text-primary-foreground mb-6">
              SecureConnect
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Enterprise-grade security platform with real-time communication. 
              Monitor threats, manage access, and collaborate securely.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="gradient-primary text-lg px-8">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-16">
            Everything you need for secure collaboration
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Security Monitoring</h3>
              <p className="text-muted-foreground">
                Real-time threat detection with suspicious login tracking, unauthorized access alerts, and risk scoring.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <MessageSquare className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Team Messaging</h3>
              <p className="text-muted-foreground">
                Secure real-time messaging with direct chats, team channels, and instant notifications.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">Team Management</h3>
              <p className="text-muted-foreground">
                Organize teams, manage members, and control access with role-based permissions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-24 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <Lock className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to secure your organization?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Start with our demo accounts to explore all features
          </p>
          <div className="inline-block bg-card rounded-xl p-6 border border-border text-left">
            <p className="text-sm text-muted-foreground mb-2">Demo Credentials:</p>
            <p className="font-mono text-sm text-foreground">Admin: admin / admin123</p>
            <p className="font-mono text-sm text-foreground">Employee: john / password123</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">SecureConnect</span>
          </div>
          <p className="text-sm text-muted-foreground">Enterprise Security Platform</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
