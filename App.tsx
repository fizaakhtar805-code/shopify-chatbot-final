
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { geminiService } from './services/geminiService';
import { Role, Message, UserProfile } from './types';
import ChatMessage from './components/ChatMessage';
import ShopifyLayout from './components/ShopifyLayout';

const QUICK_REPLIES = [
  "Show similar styles",
  "Craftsmanship & Materials",
  "Sizing advice",
  "Add to wishlist"
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: Role.MODEL,
      parts: [{ text: "Welcome to Efashion. I am your personal AI Stylist. How can I assist you today?" }],
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    shoeSize: '',
    fitPreference: 'standard'
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setSelectedImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if ((!textToSend.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      role: Role.USER,
      parts: [
        { text: textToSend },
        ...(selectedImage ? [{ inlineData: { mimeType: 'image/jpeg', data: selectedImage } }] : [])
      ],
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await geminiService.sendMessage(messages, textToSend, selectedImage || undefined, profile);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: Role.MODEL,
        parts: [{ text: "Network error. Please try again." }],
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold mb-1">Efashion AI Insights</h2>
          <p className="text-[#6d7175]">Overview of your AI styling assistant performance.</p>
        </div>
        <button className="bg-[#008060] text-white px-4 py-2 rounded font-semibold text-sm hover:bg-[#006e52]">Export Report</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Conversations', value: '1,284', trend: '+12%', color: 'text-green-600' },
          { label: 'Style Recommendations', value: '4,592', trend: '+8%', color: 'text-green-600' },
          { label: 'Conversion Rate', value: '3.2%', trend: '+0.4%', color: 'text-green-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-lg border border-[#d2d5d9] shadow-sm">
            <p className="text-xs font-semibold text-[#6d7175] uppercase tracking-wider mb-2">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stat.value}</span>
              <span className={`text-xs font-bold ${stat.color}`}>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-[#d2d5d9] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#d2d5d9] font-semibold">Recent Stylist Activity</div>
        <div className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f6f6f7] text-[#6d7175] font-medium border-b border-[#d2d5d9]">
              <tr>
                <th className="px-4 py-3">Customer ID</th>
                <th className="px-4 py-3">Primary Interest</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d2d5d9]">
              {[
                { id: '#8921', interest: 'Leather Loafers', status: 'Completed', time: '2m ago' },
                { id: '#8920', interest: 'Wedding Collection', status: 'Active', time: '5m ago' },
                { id: '#8919', interest: 'Sizing Query', status: 'Converted', time: '12m ago' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-[#f9f9f9]">
                  <td className="px-4 py-3 font-medium text-[#005bd3]">{row.id}</td>
                  <td className="px-4 py-3">{row.interest}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      row.status === 'Converted' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[#6d7175]">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderChatPreview = () => (
    <div className="p-8 h-full flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
      <div className="flex-1 space-y-6">
        <h2 className="text-xl font-bold">Live Stylist Preview</h2>
        <div className="bg-white p-6 rounded-lg border border-[#d2d5d9] shadow-sm space-y-4">
          <h3 className="font-semibold text-sm">Theme Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-[#6d7175] mb-1">Brand Primary Color</label>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-black rounded border border-[#d2d5d9]"></div>
                <span className="text-xs font-mono">#000000</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#6d7175] mb-1">Accent Color</label>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#C5A059] rounded border border-[#d2d5d9]"></div>
                <span className="text-xs font-mono">#C5A059</span>
              </div>
            </div>
            <button className="w-full bg-[#f1f2f3] text-sm font-semibold py-2 rounded border border-[#d2d5d9] hover:bg-[#e4e5e7]">
              Customize Appearance
            </button>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-3 text-blue-800">
          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
          <div className="text-sm">
            <p className="font-semibold">Merchant Tip</p>
            <p className="opacity-80">Images uploaded here are processed by Gemini 3 Pro to identify footwear silhouettes and materials automatically.</p>
          </div>
        </div>
      </div>

      {/* The Actual Chat Interface Mocked as a Phone */}
      <div className="w-full max-w-[380px] h-[700px] bg-black rounded-[3rem] p-3 shadow-2xl relative border-[6px] border-[#222]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20"></div>
        <div className="bg-white w-full h-full rounded-[2.2rem] overflow-hidden flex flex-col">
          <header className="bg-white border-b border-stone-100 px-5 py-6 flex flex-col shrink-0">
            <div className="flex items-center justify-between w-full mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black flex items-center justify-center text-white font-serif font-bold italic text-lg leading-none">E</div>
                <span className="font-serif font-bold text-sm tracking-widest uppercase">Efashion</span>
              </div>
              <div className="w-2 h-2 bg-[#C5A059] rounded-full animate-pulse"></div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
            {messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}
            {isLoading && <div className="animate-pulse bg-stone-100 h-10 w-24 rounded-lg mb-4"></div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-stone-100">
            {!isLoading && messages[messages.length-1].role === Role.MODEL && (
              <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
                {QUICK_REPLIES.map((r, i) => (
                  <button key={i} onClick={() => handleSend(r)} className="shrink-0 px-3 py-1.5 rounded-full border border-stone-200 text-[9px] font-bold uppercase tracking-widest text-stone-500 hover:border-black transition-all">
                    {r}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 bg-stone-50 rounded-lg p-2 border border-stone-100">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..." 
                className="flex-1 bg-transparent text-xs outline-none" 
              />
              <button onClick={() => handleSend()} className="bg-black text-white p-2 rounded-md">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ShopifyLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'chat' && renderChatPreview()}
      {activeTab === 'settings' && (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
           <h2 className="text-2xl font-bold">AI Configuration</h2>
           <div className="bg-white p-6 rounded-lg border border-[#d2d5d9] space-y-6">
             <div className="space-y-4">
               <h3 className="font-semibold text-lg">Knowledge Base</h3>
               <p className="text-sm text-[#6d7175]">Configure how the AI interacts with your store data.</p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-4 border rounded-lg hover:border-[#008060] cursor-pointer bg-[#f9fafb]">
                   <div className="font-bold text-sm mb-1">Product Sync</div>
                   <div className="text-xs text-[#6d7175]">Syncs your footwear catalog every 6 hours.</div>
                 </div>
                 <div className="p-4 border rounded-lg hover:border-[#008060] cursor-pointer">
                   <div className="font-bold text-sm mb-1">Brand Voice</div>
                   <div className="text-xs text-[#6d7175]">Set to "Luxury/Editorial" tone.</div>
                 </div>
               </div>
             </div>
             <div className="pt-6 border-t space-y-4">
               <h3 className="font-semibold text-lg">Model Parameters</h3>
               <div className="flex items-center justify-between">
                 <span className="text-sm font-medium">Use Gemini 3 Pro (Preview)</span>
                 <div className="w-10 h-5 bg-[#008060] rounded-full relative">
                   <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                 </div>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm font-medium">Visual Search Enabled</span>
                 <div className="w-10 h-5 bg-[#008060] rounded-full relative">
                   <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                 </div>
               </div>
             </div>
           </div>
        </div>
      )}
      {activeTab === 'analytics' && (
        <div className="p-8 flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <h3 className="text-lg font-bold">Deep Analytics Coming Soon</h3>
            <p className="text-[#6d7175]">Advanced visual heatmaps and sentiment analysis are being processed.</p>
          </div>
        </div>
      )}
    </ShopifyLayout>
  );
};

export default App;
