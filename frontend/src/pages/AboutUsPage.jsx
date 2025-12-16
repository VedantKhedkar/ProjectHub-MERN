import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { 
  Code2, Cpu, ShoppingBag, Rocket, Send, Zap, 
  ShieldCheck, CheckCircle2, Terminal, Loader2
} from 'lucide-react';

// --- Helper Components ---
const TechTag = ({ label }) => (
  <span className="bg-[#1e293b] text-[#94a3b8] border border-[#334155] px-3 py-1 rounded-full text-xs font-medium tracking-wide hover:text-[#2563eb] hover:border-[#2563eb] transition-colors">
    {label}
  </span>
);

const ServiceCard = ({ icon: Icon, title, description }) => (
  <div className="bg-[#1e293b]/80 backdrop-blur-sm p-6 rounded-2xl border border-[#334155] hover:border-[#2563eb] transition-all duration-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.15)] group relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative z-10">
      <div className="w-12 h-12 bg-[#0f172a] rounded-xl flex items-center justify-center text-[#2563eb] mb-4 shadow-inner border border-[#334155]/50 group-hover:scale-110 transition-transform duration-300">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-[#94a3b8] text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

function AboutUsPage() {
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // ==========================================
    // 👇 REPLACE THESE WITH YOUR ACTUAL KEYS 👇
    // ==========================================
    const SERVICE_ID = 'service_q82l30i';   // Get from "Email Services" tab
    const TEMPLATE_ID = 'template_kkxf94i'; // Get from "Email Templates" tab
    const PUBLIC_KEY = 'LV7AoSF3Rnd3LjVTq';    // Get from "Account" > "API Keys"

    emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        // These keys match the {{ }} variables in your EmailJS Template
        from_name: formData.name,    
        from_email: formData.email,  
        message: formData.message,
        to_email: 'projecthubadm@gmail.com',
      },
      PUBLIC_KEY
    )
    .then(() => {
      setLoading(false);
      alert('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    }, (error) => {
      setLoading(false);
      console.error(error);
      alert(`Failed to send: ${error.text}`);
    });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8 font-sans relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-[#2563eb] opacity-[0.05] blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[30rem] h-[30rem] bg-[#22d3ee] opacity-[0.03] blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-20 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-6 border-b border-[#1e293b] pb-12 pt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563eb]/10 text-[#2563eb] text-sm font-medium mb-2 border border-[#2563eb]/20">
       Project Marketplace Hub
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
            Code That <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563eb] to-[#22d3ee]">Works.</span>
          </h1>
          <p className="text-lg text-[#94a3b8] max-w-3xl mx-auto leading-relaxed">
            ProjectHub is your destination for verified prebuilt source code and custom engineering services.
          </p>
        </div>

        {/* What We Do Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">
              Buy Projects or <br/>
              <span className="text-[#2563eb]">Build Your Own.</span>
            </h2>
            <p className="text-[#94a3b8] leading-relaxed text-lg">
              We provide instant access to MERN stack projects and custom engineering services for startups and students.
            </p>
            <div className="pt-4">
              <p className="text-xs text-[#64748b] uppercase font-bold mb-4 tracking-wider">Our Tech Stack</p>
              <div className="flex flex-wrap gap-3">
                <TechTag label="React.js" />
                <TechTag label="Node & Express" />
                <TechTag label="MongoDB" />
                <TechTag label="Arduino" />
                <TechTag label="Raspberry Pi" />
                <TechTag label="Tailwind CSS" />
              </div>
            </div>
          </div>
          <div className="bg-[#1e293b]/50 backdrop-blur-md p-8 rounded-3xl border border-[#334155] grid grid-cols-2 gap-6 relative overflow-hidden">
             <div className="bg-[#0f172a] p-6 rounded-2xl border border-[#334155]/60 text-center group hover:border-[#2563eb]/50 transition-colors">
               <ShoppingBag className="text-[#2563eb] mx-auto mb-3 group-hover:scale-110 transition-transform" size={28} />
               <h4 className="text-3xl font-extrabold text-white mb-1">Store</h4>
               <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Prebuilt Code</p>
             </div>
             <div className="bg-[#0f172a] p-6 rounded-2xl border border-[#334155]/60 text-center group hover:border-[#2563eb]/50 transition-colors">
               <Cpu className="text-[#2563eb] mx-auto mb-3 group-hover:scale-110 transition-transform" size={28} />
               <h4 className="text-3xl font-extrabold text-white mb-1">IoT</h4>
               <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Hardware Lab</p>
             </div>
             <div className="bg-[#0f172a] p-6 rounded-2xl border border-[#334155]/60 text-center col-span-2 group hover:border-[#2563eb]/50 transition-colors">
               <Rocket className="text-[#2563eb] mx-auto mb-3 group-hover:scale-110 transition-transform" size={28} />
               <h4 className="text-3xl font-extrabold text-white mb-1">100+</h4>
               <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Projects Delivered</p>
             </div>
          </div>
        </div>

        {/* Services Section */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-8 bg-[#2563eb]"></div>
            <h2 className="text-3xl font-bold text-white">Our Services</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ServiceCard 
              icon={ShoppingBag}
              title="Prebuilt Marketplace"
              description="Verified projects with source code and documentation. Instant download."
            />
            <ServiceCard 
              icon={Code2}
              title="Custom Software"
              description="Tailored Web & Mobile applications built to your logic using MERN stack."
            />
            <ServiceCard 
              icon={Cpu}
              title="Hardware Integration"
              description="IoT systems, sensors, and automation with Arduino & Raspberry Pi."
            />
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-[#1e293b]/30 rounded-2xl p-10 border border-dashed border-[#334155]">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-center">
              <div className="flex flex-col items-center gap-3">
                 <ShieldCheck className="text-[#2563eb]" size={28} />
                 <h4 className="font-bold text-white text-lg">Bug-Free</h4>
              </div>
              <div className="flex flex-col items-center gap-3">
                 <Zap className="text-[#2563eb]" size={28} />
                 <h4 className="font-bold text-white text-lg">Instant Access</h4>
              </div>
              <div className="flex flex-col items-center gap-3">
                 <Rocket className="text-[#2563eb]" size={28} />
                 <h4 className="font-bold text-white text-lg">Setup Support</h4>
              </div>
              <div className="flex flex-col items-center gap-3">
                 <CheckCircle2 className="text-[#2563eb]" size={28} />
                 <h4 className="font-bold text-white text-lg">Affordable</h4>
              </div>
           </div>
        </div>

        {/* --- CONTACT FORM --- */}
        <div className="bg-[#1e293b] rounded-3xl p-8 md:p-12 border border-[#334155] shadow-2xl relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#2563eb] opacity-20 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-4xl font-bold text-white">Request a Project</h2>
              <p className="text-[#94a3b8] text-lg">
                Need a custom solution? Fill out the form below to reach our dev team.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="w-12 h-12 rounded-full bg-[#0f172a] flex items-center justify-center text-[#2563eb] border border-[#334155]">
                  <Send size={20} />
                </div>
                <div>
                  <p className="text-xs text-[#64748b] font-bold uppercase">Email Us</p>
                  <p className="text-white font-medium">projecthubadm@gmail.com</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 bg-[#0f172a]/50 p-6 rounded-2xl border border-[#334155]/50 backdrop-blur-md">
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider pl-1">Name</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" className="w-full bg-[#0f172a] border border-[#334155] rounded-xl p-4 text-white focus:outline-none focus:border-[#2563eb] transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider pl-1">Email</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" className="w-full bg-[#0f172a] border border-[#334155] rounded-xl p-4 text-white focus:outline-none focus:border-[#2563eb] transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider pl-1">Requirement</label>
                  <textarea required rows="4" name="message" value={formData.message} onChange={handleChange} placeholder="I need a Library Management System..." className="w-full bg-[#0f172a] border border-[#334155] rounded-xl p-4 text-white focus:outline-none focus:border-[#2563eb] transition-all resize-none"></textarea>
                </div>
                
                <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-[#2563eb] text-white font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:bg-[#1d4ed8] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AboutUsPage;