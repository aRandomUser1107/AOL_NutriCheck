import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  Target, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  ChevronDown 
} from "lucide-react";

interface RegisterPageProps {
  onSwitch?: () => void; // Made optional with '?'
}

export default function RegisterPage({ onSwitch = () => {} }: RegisterPageProps) { // Default parameter added
  const [role, setRole] = useState("user");

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen relative text-[#1F363D] font-sans overflow-hidden flex flex-col bg-[#CFE0C3]/10"
    >
      {/* Background Image Layer */}
      <AnimatePresence mode="wait">
        <motion.div 
          key="register"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-[#F2F7F2]"
          style={{ backgroundImage: 'url("/asset/register.png")' }}
        />
      </AnimatePresence>
      
      {/* Organic overlay */}
      <div className="fixed inset-0 z-0 bg-[#F2F7F2]/40 backdrop-blur-[1px] pointer-events-none" />

      {/* Navbar */}
      <nav className="w-full px-12 md:px-20 py-8 md:py-10 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl md:text-3xl font-bold tracking-tighter text-[#1F363D] font-serif">NutriCheck</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[13px] md:text-[14px] font-black text-[#1F363D] uppercase tracking-[0.1em]">
              Back to system?
            </span>
            <button 
              onClick={onSwitch}
              className="text-[#40798C] font-black hover:text-[#1F363D] transition-all duration-300 cursor-pointer uppercase tracking-[0.1em] text-[13px] md:text-[14px] mt-1 hover:underline underline-offset-4"
            >
              Sign In Here
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex relative items-center justify-center -mt-8 md:-mt-12">
        <main className="max-w-6xl w-full mx-auto px-12 md:px-20 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center h-full">
          
          {/* Left Column: Welcome/Heading (4 cols) */}
          <div className="lg:col-span-4 hidden lg:flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key="register-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div className="w-12 h-1.5 bg-[#40798C] mb-2 rounded-full shadow-sm" />
                <h2 className="text-[3rem] xl:text-[4.5rem] font-serif font-bold leading-[0.95] text-[#1F363D] tracking-tighter">
                  Join the <br /><span className="text-[#40798C]">Movement.</span>
                </h2>
                <p className="text-sm text-[#1F363D]/80 font-bold max-w-[320px] leading-relaxed">
                  Start your journey towards a healthier lifestyle with personalized tracking.
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Center Column: Form Card (5 cols) */}
          <div className="lg:col-span-5 flex justify-center items-center z-10 w-full">
            <motion.div
              layout
              className="bg-white/95 backdrop-blur-3xl w-full max-w-[420px] min-h-[580px] rounded-[2.5rem] shadow-[0_45px_100px_-20px_rgba(31,54,61,0.18)] py-14 px-6 border border-white/80 relative overflow-hidden flex flex-col justify-center items-center"
            >
              <div className="text-center flex flex-col gap-3 mb-10 w-full max-w-[290px] mx-auto">
                 <h3 className="text-[2.5rem] font-bold font-serif text-[#1F363D] tracking-tight leading-tight">
                   Register
                 </h3>
                 <div className="flex items-center justify-center gap-2.5">
                   <div className="h-[1.5px] w-10 bg-[#40798C]/20" />
                   <p className="text-[12px] md:text-[13px] text-[#40798C] font-black tracking-[0.22em] uppercase">
                     Official Access
                   </p>
                   <div className="h-[1.5px] w-10 bg-[#40798C]/20" />
                 </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key="register-form"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col gap-6 w-full max-w-[290px] mx-auto"
                >
                  <div className="flex flex-col gap-3.5">
                    <FormInput icon={<User className="w-5 h-5" />} type="text" placeholder="Your Name" />
                    <FormInput icon={<Mail className="w-5 h-5" />} type="email" placeholder="Email Address" />
                    <FormInput icon={<Lock className="w-5 h-5" />} type="password" placeholder="Passphrase" />
                    
                    <div className="relative w-full">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#40798C]/85 transition-colors z-20 flex items-center justify-center pointer-events-none">
                        <Activity className="w-5 h-5" />
                      </div>
                      <select 
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-[#f4f7f5] hover:bg-[#ebf0ed] focus:bg-white border border-[#1F363D]/10 focus:border-[#40798C] rounded-2xl h-14 outline-none transition-all font-semibold text-[#1F363D] appearance-none cursor-pointer text-base focus:ring-4 focus:ring-[#40798C]/10 z-10"
                        style={{ paddingLeft: "3.5rem", paddingRight: "2.5rem" }}
                      >
                        <option value="user">User Role</option>
                        <option value="nutritionist">Professional Nutritionist</option>
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F363D]/40 pointer-events-none z-20" />
                    </div>
                  </div>

                  <button className="w-full bg-[#40798C] text-[#F2F7F2] h-14 flex items-center justify-center rounded-2xl font-bold text-sm hover:bg-[#1F363D] hover:text-white shadow-lg shadow-[#40798C]/10 transition-all active:scale-[0.98] cursor-pointer tracking-widest uppercase">
                    Create Health Account
                  </button>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right Column: Features (3 cols) */}
          <div className="lg:col-span-3 hidden lg:flex flex-col justify-center gap-6">
            <AnimatePresence mode="wait">
              <motion.div
                key="reg-feat"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="flex flex-col gap-6"
              >
                <FeatureStrip icon={<Activity className="w-5 h-5" />} label="Personalized nutrition tracking" />
                <FeatureStrip icon={<Target className="w-5 h-5" />} label="Insights for a healthier you" />
                <FeatureStrip icon={<ShieldCheck className="w-5 h-5" />} label="Your data is safe and secure" />
              </motion.div>
            </AnimatePresence>
          </div>

        </main>
      </div>

      {/* Spacing for background image to shine at bottom */}
      <div className="h-24 w-full" />
    </motion.div>
  );
}

function FeatureStrip({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, x: 5 }}
      className="flex items-center gap-5 py-4 px-6 bg-white/95 backdrop-blur-3xl border border-white/85 rounded-2xl w-full max-w-[340px] shadow-[0_15px_35px_-8px_rgba(31,54,61,0.08)]"
    >
      <div className="w-10 h-10 bg-[#40798C]/10 rounded-xl flex items-center justify-center text-[#40798C] shrink-0">
        {icon}
      </div>
      <span className="text-sm font-bold text-[#1F363D]/90 tracking-wide leading-snug">
        {label}
      </span>
    </motion.div>
  );
}

function FormInput({ icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) {
  return (
    <div className="relative w-full">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#40798C]/85 transition-colors z-20 flex items-center justify-center pointer-events-none">
        {icon}
      </div>
      <input
        {...props}
        className="w-full bg-[#f4f7f5] hover:bg-[#ebf0ed] focus:bg-white border border-[#1F363D]/10 focus:border-[#40798C] rounded-2xl h-14 outline-none transition-all font-semibold text-[#1F363D] placeholder:text-[#1F363D]/35 text-base focus:ring-4 focus:ring-[#40798C]/10 z-10"
        style={{ paddingLeft: "3.5rem", paddingRight: "1.5rem" }}
      />
    </div>
  );
}