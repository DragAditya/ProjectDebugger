import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import DebugResults from "@/components/debug-results";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, Copy } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
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

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      duration: 0.6,
      bounce: 0.3
    }
  }
};

export default function HomePage() {
  const { logoutMutation, user } = useAuth();
  const { toast } = useToast();
  const [language, setLanguage] = useState("javascript");
  const [targetLanguage, setTargetLanguage] = useState("python");
  const [code, setCode] = useState("");

  const debugMutation = useMutation({
    mutationFn: async (data: { code: string; language: string }) => {
      const res = await apiRequest("POST", "/api/debug", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Code analyzed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to analyze code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const translateMutation = useMutation({
    mutationFn: async (data: { code: string; fromLanguage: string; toLanguage: string }) => {
      const res = await apiRequest("POST", "/api/translate", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Code translated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to translate code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const explainMutation = useMutation({
    mutationFn: async (data: { code: string; language: string }) => {
      const res = await apiRequest("POST", "/api/explain", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Code explained successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to explain code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getResults = () => {
    if (translateMutation.data) return translateMutation.data;
    if (explainMutation.data) return explainMutation.data;
    return debugMutation.data;
  };

  const clearOtherResults = (keeping: 'debug' | 'translate' | 'explain') => {
    if (keeping !== 'debug') debugMutation.reset();
    if (keeping !== 'translate') translateMutation.reset();
    if (keeping !== 'explain') explainMutation.reset();
  };

  const handleDebugWithReset = () => {
    clearOtherResults('debug');
    debugMutation.mutate({ code, language });
  };

  const handleTranslateWithReset = () => {
    clearOtherResults('translate');
    translateMutation.mutate({ code, fromLanguage: language, toLanguage: targetLanguage });
  };

  const handleExplainWithReset = () => {
    clearOtherResults('explain');
    explainMutation.mutate({ code, language });
  };

  const handleCopy = () => {
    const results = getResults();
    const codeToCopy = results?.correctedCode || results?.translatedCode || '';
    navigator.clipboard.writeText(codeToCopy);
    toast({
      title: "Code copied to clipboard",
    });
  };

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';

  return (
    <motion.div 
      className="min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header 
        className="border-b bg-background/95 backdrop-blur-sm"
        variants={itemVariants}
      >
        <div className="container mx-auto px-4 py-4 flex justify-end items-center gap-4">
          <motion.span 
            className="text-2xl font-semibold bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent"
            variants={fadeInScale}
          >
            {username}
          </motion.span>
          <motion.div 
            className="bg-background/95 rounded-md p-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ThemeToggle />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="bg-background/95"
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </Button>
          </motion.div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8">
        <motion.div 
          className="grid md:grid-cols-2 gap-8"
          variants={containerVariants}
        >
          <motion.div className="space-y-4" variants={itemVariants}>
            <div className="flex justify-between items-center">
              <motion.h2 
                className="text-xl font-semibold"
                variants={fadeInScale}
              >
                Code Input
              </motion.h2>
              <motion.div 
                className="bg-background/95 rounded-md"
                variants={fadeInScale}
              >
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            </div>
            <motion.div variants={fadeInScale}>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your code here..."
                className="min-h-[400px] font-mono bg-background/95 backdrop-blur-sm"
              />
            </motion.div>
            <div className="space-y-2">
              <motion.div 
                variants={fadeInScale}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0"
                  onClick={handleDebugWithReset}
                  disabled={debugMutation.isPending}
                >
                  {debugMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Debug Code
                </Button>
              </motion.div>

              <div className="flex gap-2">
                <motion.div 
                  className="flex-1"
                  variants={fadeInScale}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className="w-full bg-background/95"
                    variant="outline"
                    onClick={handleTranslateWithReset}
                    disabled={translateMutation.isPending}
                  >
                    {translateMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Translate Code
                  </Button>
                </motion.div>
                <motion.div 
                  className="bg-background/95 rounded-md"
                  variants={fadeInScale}
                >
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              </div>

              <motion.div 
                variants={fadeInScale}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="w-full bg-background/95"
                  variant="outline"
                  onClick={handleExplainWithReset}
                  disabled={explainMutation.isPending}
                >
                  {explainMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Explain Code
                </Button>
              </motion.div>
            </div>
          </motion.div>

          <motion.div className="space-y-4" variants={itemVariants}>
            <motion.h2 
              className="text-xl font-semibold"
              variants={fadeInScale}
            >
              Results
            </motion.h2>
            <motion.div 
              className="relative bg-background/95 rounded-lg p-4"
              variants={fadeInScale}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={getResults()?.id || 'empty'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={handleCopy}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <DebugResults
                    results={getResults()}
                    language={targetLanguage}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
    </motion.div>
  );
}