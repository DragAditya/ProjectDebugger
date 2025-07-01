import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Typewriter } from "./typewriter-text";
import WavesBackground from "./waves-background";
import { ArrowRight, Code, Zap, Shield, Sparkles } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      duration: 0.8,
      bounce: 0.4
    }
  }
};

const floatVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const features = [
  {
    icon: Code,
    title: "AI-Powered Debugging",
    description: "Instantly analyze and fix code errors with advanced AI"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Get debugging results and code explanations in seconds"
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your code is processed securely with enterprise-grade protection"
  }
];

export function Hero() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    if (user) {
      setLocation("/home");
    } else {
      setLocation("/auth");
    }
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background Elements */}
      <WavesBackground />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      {/* Content */}
      <motion.div
        className="relative z-10 container-fluid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <header className="flex items-center justify-between py-6">
          <motion.div variants={itemVariants}>
            <h1 className="text-2xl font-bold gradient-text">ALTER</h1>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Button
              onClick={() => setLocation("/auth")}
              variant="outline"
              className="glass border-primary/30 hover:border-primary/50"
            >
              {user ? "Dashboard" : "Sign In"}
            </Button>
          </motion.div>
        </header>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
          
          {/* Hero Text */}
          <motion.div variants={itemVariants} className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full border border-border/30">
                AI-Powered Code Analysis
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="text-foreground">Debug Code with</span>
              <br />
                             <span className="gradient-text">
                 <Typewriter 
                   text={["Intelligence", "Precision", "Speed", "Confidence"]}
                   className="gradient-text"
                   loop={true}
                 />
               </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform your development workflow with AI-powered code debugging, 
              translation, and explanation tools that understand your code like never before.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="btn-primary group text-lg px-8 py-4"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              onClick={() => setLocation("/chat")}
              variant="outline"
              size="lg"
              className="glass border-primary/30 hover:border-primary/50 text-lg px-8 py-4"
            >
              Try Chat Demo
            </Button>
          </motion.div>

          {/* Features Grid */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={floatVariants}
                animate="animate"
                style={{ animationDelay: `${index * 2}s` }}
                className="modern-card p-6 text-center space-y-4 group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-8 mt-12 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold gradient-text">99.9%</div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold gradient-text">&lt;2s</div>
              <div className="text-sm text-muted-foreground">Analysis Time</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold gradient-text">24/7</div>
              <div className="text-sm text-muted-foreground">Availability</div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/30 mt-16">
          <p>Built with ❤️ using React, TypeScript, and AI technology</p>
        </footer>
      </motion.div>
    </div>
  );
}