"use client"

import { useState, useRef, useEffect, ChangeEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Sparkles,
  Layers,
  Users,
  BarChart3,
  Sun,
  Moon,
  Upload,
  Check,
  Trash2,
  AlertTriangle,
  Zap,
  Target,  BrainCircuit,
  ChevronDown
} from "lucide-react"

// --- 1. DEFINE DATA TYPES (Fixes "Property does not exist" errors) ---
interface RoutingDecision {
  decision: "Simple" | "Complex" | "Review_Queue";
  confidence: number;
  tags: string[];
  reason: string;
}

interface Aspect {
  aspect: string;
  sentiment: string;
  severity: string;
}

interface AnalysisResult {
  summary: string;
  aspects: Aspect[];
  status: string;
}

// This matches the JSON coming from your backend (main.py)
interface BackendResponse {
  id: string;
  text: string;
  routing: RoutingDecision;
  analysis: AnalysisResult | null;
  status: string;
}

// --- 2. USER DASHBOARD COMPONENT (Clean Text Button) ---
function UserDashboard() {
  const [inputValue, setInputValue] = useState<string>("")
  const [result, setResult] = useState<BackendResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [history, setHistory] = useState<BackendResponse[]>([]) 

  // --- PERSISTENCE LOGIC ---
  useEffect(() => {
    const savedInput = sessionStorage.getItem("dash_input")
    const savedResult = sessionStorage.getItem("dash_result")
    const savedHistory = sessionStorage.getItem("dash_history")

    if (savedInput) setInputValue(savedInput)
    if (savedResult && savedResult !== "null") setResult(JSON.parse(savedResult))
    if (savedHistory) setHistory(JSON.parse(savedHistory))
  }, [])

  useEffect(() => {
    sessionStorage.setItem("dash_input", inputValue)
  }, [inputValue])

  useEffect(() => {
    sessionStorage.setItem("dash_result", JSON.stringify(result))
  }, [result])

  useEffect(() => {
    sessionStorage.setItem("dash_history", JSON.stringify(history))
  }, [history])

  const handleAnalyze = async () => {
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            text: inputValue,
            id: "req_" + Date.now().toString() 
        }), 
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data: BackendResponse = await response.json();
      setResult(data);
      setHistory(prev => [data, ...prev]);

    } catch (error) {
      console.error("Connection Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const getSentimentColor = (sentiment: string) => {
    const s = sentiment?.toLowerCase() || "";
    if (s.includes('negative')) return 'text-red-400 border-red-500/20 bg-red-500/10';
    if (s.includes('positive')) return 'text-green-400 border-green-500/20 bg-green-500/10';
    return 'text-blue-400 border-blue-500/20 bg-blue-500/10';
  }

  return (
    <div className="pt-24 px-6 min-h-screen flex flex-col items-center justify-start">
      <div className="w-full max-w-6xl space-y-12">
        {/* INPUT SECTION */}
        <div className="space-y-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group max-w-3xl mx-auto"
          >
            <textarea
              value={inputValue}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
              placeholder="Enter complaint or feedback..."
              rows={2}
              className="w-full text-4xl font-semibold bg-transparent border-none outline-none text-white placeholder:text-zinc-700 focus:placeholder:text-zinc-600 transition-colors resize-none text-center overflow-hidden"
            />
          </motion.div>

          <motion.button
            onClick={handleAnalyze}
            disabled={isLoading}
            className={`group relative px-8 py-4 rounded-xl border transition-all overflow-hidden ${
                isLoading 
                ? "bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed" 
                : "bg-zinc-900/40 border-white/10 text-zinc-200 hover:text-white hover:border-white/20 hover:bg-zinc-900/60"
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 transition-opacity ${isLoading ? "opacity-0" : "opacity-0 group-hover:opacity-100"}`} />
            {/* UPDATED: No Icon, just clean text */}
            <span className="relative flex items-center justify-center font-medium text-lg">
              {isLoading ? "Analyzing..." : "Analyze with AI"}
            </span>
          </motion.button>
        </div>

        {/* RESULTS SECTION */}
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12"
          >
            {/* ROUTING CARD */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/10" 
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Routing Decision</span>
                  {result.routing.decision === 'Review_Queue' ? (
                      <span className="flex items-center gap-2 text-xs font-bold text-orange-400 bg-orange-400/10 px-3 py-1 rounded-full border border-orange-400/20">
                        <AlertTriangle className="w-3 h-3" />
                        Needs Review
                      </span>
                  ) : (
                      <span className="flex items-center gap-2 text-xs font-bold text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        Active
                      </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-white">
                    {result.routing.decision === 'Simple' ? "Simple (Handled by CPU)" : 
                     result.routing.decision === 'Review_Queue' ? "Flagged for Human Review" : 
                     "Complex (Deep LLM Analysis)"}
                </p> 
                <p className="text-sm text-zinc-400">{result.routing.reason}</p>
              </div>
            </motion.div>

            {/* ANALYSIS CARD */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/10"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">GPU Analysis</span>
                  <span className="flex items-center gap-2 text-xs font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    Complete
                  </span>
                </div>
                {result.analysis ? (
                    <div className="space-y-4">
                        <p className="text-lg font-medium text-zinc-200 leading-relaxed">
                            {result.analysis.summary}
                        </p>
                        {result.analysis.aspects && result.analysis.aspects.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                                {result.analysis.aspects.map((aspect, idx) => (
                                    <div key={idx} className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-medium ${getSentimentColor(aspect.sentiment)}`}>
                                        <span className="text-zinc-200">{aspect.aspect}</span>
                                        <span className="opacity-40">|</span>
                                        <span>{aspect.sentiment}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-lg font-medium text-zinc-200 leading-relaxed">
                        {result.status}
                    </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* RECENT ACTIVITY */}
        {history.length > 0 && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="pt-12 border-t border-white/5"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Recent Activity</h3>
                    <span className="text-xs text-zinc-600">Session History</span>
                </div>
                <div className="space-y-3">
                    {history.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="group flex items-center justify-between p-4 rounded-xl bg-zinc-900/20 border border-white/5 hover:bg-zinc-900/40 hover:border-white/10 transition-all">
                            <div className="flex items-center gap-4 overflow-hidden">
                                <div className={`p-2 rounded-lg ${
                                    item.routing.decision === 'Simple' ? 'bg-blue-500/10 text-blue-400' :
                                    item.routing.decision === 'Review_Queue' ? 'bg-orange-500/10 text-orange-400' :
                                    'bg-purple-500/10 text-purple-400'
                                }`}>
                                    {item.routing.decision === 'Simple' ? <Zap className="w-4 h-4" /> : 
                                     item.routing.decision === 'Review_Queue' ? <AlertTriangle className="w-4 h-4" /> : 
                                     <Layers className="w-4 h-4" />}
                                </div>
                                <span className="text-zinc-400 text-sm truncate max-w-md group-hover:text-zinc-200 transition-colors">
                                    {item.text}
                                </span>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded font-medium ${
                                item.routing.decision === 'Simple' ? 'text-blue-400 bg-blue-400/10' :
                                item.routing.decision === 'Review_Queue' ? 'text-orange-400 bg-orange-400/10' :
                                'text-purple-400 bg-purple-400/10'
                            }`}>
                                {item.routing.decision === 'Review_Queue' ? 'Flagged' : item.routing.decision}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>
        )}
      </div>
    </div>
  )
}

// --- 3. BATCH INTERFACES (Fixes "Property does not exist" in BatchProcessing) ---
interface PreviewRow {
  id: string;
  text: string;
  sentiment: string;
  sentiment_score: number;
  tag: string;
  action: string;
}

interface BatchInsightsData {
  auto_resolved: number;
  critical: number;
  negative: number;
  preview_rows: number;
  row_errors: number;
  precision?: number; // Optional because legacy batches might not have it
}

interface BatchItem {
  id: number | string;
  filename: string;
  status: string;
  items: number;
  processed: number;
}

interface CurrentInsightsState {
  filename: string;
  data: PreviewRow[];
}

// --- 4. BATCH PROCESSING COMPONENT (Compact Design) ---
function BatchProcessing() {
  // --- STATE MANAGEMENT ---
  const [batches, setBatches] = useState<BatchItem[]>([
    { id: 1, filename: "customer_feedback_q4.csv", status: "completed", items: 1240, processed: 1240 },
    { id: 2, filename: "survey_responses_2024.json", status: "processing", items: 856, processed: 573 },
  ])
  
  const [currentInsights, setCurrentInsights] = useState<CurrentInsightsState | null>(null)
  
  // Upload Workflow State
  const [batchInsights, setBatchInsights] = useState<BatchInsightsData | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  // --- REHYDRATE LAST BATCH ON MOUNT ---
  useEffect(() => {
    const loadLatestBatch = async () => {
      try {
        const res = await fetch("http://localhost:8000/batch/latest")
        if (!res.ok) return

        const json = await res.json()
        if (!json.exists) return

        const data = json.data

        setCurrentInsights({
          filename: data.filename,
          data: data.preview
        })

        setBatchInsights(data.insights)

        setBatches(prev => [
          {
            id: Date.now(),
            filename: data.filename,
            status: data.status,
            items: data.items,
            processed: data.processed
          },
          ...prev
        ])
      } catch (e) {
        console.error("Failed to rehydrate batch", e)
      }
    }

    loadLatestBatch()
  }, [])


  // UI Toggles
  const [showHistory, setShowHistory] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- HANDLERS ---
  const handleAreaClick = () => fileInputRef.current?.click()
  
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setSelectedFile(files[0])
    setUploadSuccess(null)
    setCurrentInsights(null)
    setBatchInsights(null)
  }

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }
  const handleDragLeave = () => setIsDragging(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    handleFileSelect(e.dataTransfer.files)
  }

  const handleStartAnalysis = async () => {
    if (!selectedFile) return
    
    setIsProcessing(true)
    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const response = await fetch("http://localhost:8000/batch/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error(`Upload failed: ${response.status}`)

      const result = await response.json()
      
      const newBatch: BatchItem = {
        id: result.id,
        filename: result.filename,
        status: result.status,
        items: result.items,
        processed: result.processed
      }
      setBatches(prev => [newBatch, ...prev])
      
      setCurrentInsights({
        filename: result.filename,
        data: result.preview
      })

      if (result.insights) {
        setBatchInsights(result.insights)
      }

      setUploadSuccess(`Successfully processed ${result.items.toLocaleString()} records from ${result.filename}`)
      setSelectedFile(null) 

    } catch (error: any) {
      console.error("Error:", error)
      setUploadSuccess(`Error: ${error.message || "Unknown error"}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedFile(null)
  }

  // --- DERIVED METRICS ---
  const totalProcessed = batches.reduce((sum, b) => sum + b.processed, 0)
  const tableData = currentInsights ? currentInsights.data : []
  
  // Logic: (Auto Resolved Count / Total In Latest Batch) * 100
  const latestBatch = batches.length > 0 ? batches[0] : null;
  const autoResolvedCount = batchInsights ? batchInsights.auto_resolved : 0;
  
  let resolutionRate = "0.0";
  if (batchInsights && latestBatch && latestBatch.processed > 0) {
      resolutionRate = ((autoResolvedCount / latestBatch.processed) * 100).toFixed(1);
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-6 py-8 relative">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        
        {/* TOP SECTION: COMPACT GRID (Fixed Height 180px) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-[180px]">
            
            {/* LEFT COL: COMPACT UPLOAD AREA */}
            <div className="lg:col-span-9 h-[180px]">
                <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e.target.files)} className="hidden" accept=".csv" />
                
                {!selectedFile ? (
                  <motion.div
                    onClick={handleAreaClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative h-full flex flex-row items-center justify-center gap-6 px-6 rounded-2xl border border-dashed transition-all cursor-pointer group ${
                      isDragging ? "border-blue-400 bg-blue-500/10" : "border-white/10 bg-zinc-900/30 hover:bg-zinc-900/50"
                    }`}
                  >
                    <div className="p-3 rounded-full bg-zinc-900 shadow-md group-hover:scale-110 transition-transform border border-white/5">
                          <Upload className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-left">
                        <p className="text-lg font-medium text-white">Upload Dataset</p>
                        <p className="text-sm text-zinc-500">Drag & drop or click to browse (CSV)</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative h-full flex flex-col items-center justify-center p-6 rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm"
                  >
                      <div className="w-full max-w-lg flex items-center gap-4">
                        <div className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                <Layers className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{selectedFile.name}</p>
                                <p className="text-xs text-zinc-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button onClick={handleRemoveFile} className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-red-400 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <button 
                            onClick={handleStartAnalysis}
                            disabled={isProcessing}
                            className={`px-6 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                                isProcessing 
                                ? "bg-zinc-800 text-zinc-500 cursor-wait" 
                                : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg"
                            }`}
                        >
                            {isProcessing ? (
                                <>
                                    <Sparkles className="w-4 h-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4 fill-current" />
                                    Run Analysis
                                </>
                            )}
                        </button>
                      </div>
                  </motion.div>
                )}
            </div>

            {/* RIGHT COL: COMPACT STATS (Stacked to match height) */}
            <div className="lg:col-span-3 flex flex-col gap-3 h-[180px]">
                
                {/* Total Processed - Mini Card */}
                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex-1 px-5 py-3 rounded-xl bg-zinc-900/40 backdrop-blur-xl border border-white/10 cursor-pointer hover:border-blue-500/30 transition-colors flex flex-col justify-center relative overflow-hidden"
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Processed</span>
                        <Layers className="w-4 h-4 text-zinc-600" />
                    </div>
                    <div className="text-3xl font-mono font-bold text-white tracking-tight">
                        {(totalProcessed || 0).toLocaleString()}
                    </div>
                    
                    {/* Popover Logic remains same, just hidden overflow handled by layout */}
                    <AnimatePresence>
                        {showHistory && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-zinc-900 z-20 p-4 flex flex-col justify-center items-center text-center"
                            >
                                <p className="text-xs text-zinc-400 mb-2">Check history in dashboard</p>
                                <button onClick={(e) => { e.stopPropagation(); setShowHistory(false); }} className="text-xs bg-white/10 px-2 py-1 rounded text-white">Close</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Auto-Resolution - Mini Card */}
                <div className="flex-1 px-5 py-3 rounded-xl bg-zinc-900/40 backdrop-blur-xl border border-white/10 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-1">
                         <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Auto-Resolution</span>
                         <span className="text-[10px] text-green-400 font-medium bg-green-500/10 px-1.5 py-0.5 rounded">CPU Tier</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <div className="text-3xl font-mono font-bold text-white tracking-tight">{resolutionRate}%</div>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1 mt-2">
                        <div className="bg-green-500 h-1 rounded-full" style={{ width: `${Math.min(parseFloat(resolutionRate), 100)}%` }} />
                    </div>
                </div>
            </div>
        </div>

        {/* SUCCESS MESSAGE BANNER */}
        <AnimatePresence>
            {uploadSuccess && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl bg-green-500/10 border border-green-500/20 p-3 flex items-center gap-3 text-green-400 text-sm"
                >
                    <Check className="w-4 h-4" />
                    <span className="font-medium">{uploadSuccess}</span>
                </motion.div>
            )}
        </AnimatePresence>

        {/* BOTTOM SECTION: LIVE ANALYSIS TABLE */}
        {currentInsights ? (
            <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/10 overflow-hidden"
            >
                {/* Compact Header */}
                <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        <h3 className="text-sm font-semibold text-white">
                            Live Analysis: <span className="text-zinc-400">{currentInsights.filename}</span>
                        </h3>
                    </div>
                    <div className="text-[10px] font-medium text-zinc-500 bg-white/5 px-2 py-1 rounded border border-white/5">
                        Showing All Records
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5 bg-black/20">
                                <th className="text-left py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">ID</th>
                                <th className="text-left py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider w-[50%]">Complaint Text</th>
                                <th className="text-left py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Sentiment</th>
                                <th className="text-right py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Tag</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {tableData.map((row, idx) => (
                                <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="py-3 px-6 font-mono text-[10px] text-zinc-600">{row.id}</td>
                                    <td className="py-3 px-6 text-xs text-zinc-300">
                                        <p className="line-clamp-1 group-hover:line-clamp-none transition-all">{row.text}</p>
                                    </td>
                                    {/* Sentiment Bar Column */}
                                    <td className="py-3 px-6">
                                        <div className="flex flex-col gap-1 w-20">
                                            <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500">
                                                <span>{row.sentiment}</span>
                                                <span>{row.sentiment_score}%</span>
                                            </div>
                                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${
                                                        row.sentiment === 'Negative' ? 'bg-red-500' :
                                                        row.sentiment === 'Positive' ? 'bg-green-500' : 'bg-yellow-500'
                                                    }`}
                                                    style={{ width: `${row.sentiment_score}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-6 text-right">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${
                                            row.tag === 'Critical' ? 'bg-red-500/5 text-red-400 border-red-500/20' :
                                            row.tag === 'Complex' ? 'bg-orange-500/5 text-orange-400 border-orange-500/20' :
                                            'bg-blue-500/5 text-blue-400 border-blue-500/20'
                                        }`}>
                                            {row.tag}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center py-20 text-zinc-600 border border-dashed border-white/10 rounded-2xl bg-zinc-900/20">
                <BarChart3 className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-zinc-500 text-sm font-medium">Upload a CSV to generate live preview</p>
            </div>
        )}

      </div>
    </div>
  )
}




// --- 5. ANNOTATOR INTERFACES ---
interface AnnotatorItem {
  id: string;
  text: string;
  flag: "high" | "medium" | "low";
}

// What the backend sends (from main.py: /annotator/queue)
interface RawQueueItem {
  id: string;
  text: string;
  reason: string; 
}

// --- 6. ANNOTATOR WORKSPACE COMPONENT (Fixed Styles) ---
function AnnotatorWorkspace() {
  // Fix: Define queue as a list of AnnotatorItem
  const [queue, setQueue] = useState<AnnotatorItem[]>([])
  
  // Fix: Define these as Objects where Key=String and Value=String
  const [remarks, setRemarks] = useState<Record<string, string>>({})
  const [labels, setLabels] = useState<Record<string, string>>({})
  
  const [sessionImpact, setSessionImpact] = useState<number>(0)

  // Fix: Type the arguments
  const handleRemarkChange = (id: string, value: string) => {
    setRemarks(prev => ({ ...prev, [id]: value }))
  }

  const handleLabelChange = (id: string, value: string) => {
    setLabels(prev => ({ ...prev, [id]: value }))
  }

  const handleDelete = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id))
  }

  const handlePushAll = async () => {
    for (const item of queue) {
      try {
        await fetch("http://localhost:8000/annotator/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: item.id,
            text: item.text,
            corrected_label: labels[item.id] || "Validated",
            remark: remarks[item.id] || ""
          })
        })
      } catch (err) {
        console.error("Validation failed for:", item.id, err)
      }
    }

    setSessionImpact(prev => prev + queue.length)
    setQueue([])
    setRemarks({})
    setLabels({})
  }

  useEffect(() => {
    fetch("http://localhost:8000/annotator/queue")
      .then(res => res.json())
      .then((data: RawQueueItem[]) => { 
        if (Array.isArray(data)) {
          setQueue(
            data.map(row => ({
              id: row.id,
              text: row.text,
              flag: (row.reason?.toLowerCase() || "").includes("critical")
                ? "high"
                : (row.reason?.toLowerCase() || "").includes("contrast")
                ? "medium"
                : "low"
            }))
          )
        }
      })
      .catch(err => {
        console.error("Failed to load review queue:", err)
      })
  }, [])

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-6 py-12 relative flex justify-center">
      <div className="w-full max-w-[85rem] space-y-8">

        {/* Header Stats */}
        <div className="flex items-center justify-center gap-12">
          <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-zinc-900/40 border border-white/10 min-w-[200px]">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-mono font-bold text-white leading-none">
                {queue.length}
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold mt-1.5">
                Pending Review
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 px-6 py-3 rounded-2xl bg-zinc-900/40 border border-white/10 min-w-[200px]">
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-white leading-none">
                {sessionImpact}
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold mt-1.5">
                Validated
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-green-500/10 text-green-400">
              <Check className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-black/20">
                <th className="px-8 py-5 text-center text-sm font-bold text-zinc-500 uppercase w-24">Flag</th>
                <th className="px-8 py-5 text-sm font-bold text-zinc-500 uppercase w-[45%]">Complaint Text</th>
                <th className="px-8 py-5 text-sm font-bold text-zinc-500 uppercase">Reviewer Remark</th>
                <th className="px-8 py-5 text-sm font-bold text-zinc-500 uppercase w-56">Correct Label</th>
                <th className="px-8 py-5 text-center text-sm font-bold text-zinc-500 uppercase w-24">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {queue.map(item => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5 text-center">
                    <div className={`w-2.5 h-2.5 mx-auto rounded-full ${
                      item.flag === "high"
                        ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                        : item.flag === "medium"
                        ? "bg-orange-500"
                        : "bg-blue-500"
                    }`} />
                  </td>

                  <td className="px-8 py-5 text-zinc-200">{item.text}</td>

                  <td className="px-8 py-5">
                    <input
                      type="text"
                      value={remarks[item.id] || ""}
                      onChange={(e) => handleRemarkChange(item.id, e.target.value)}
                      placeholder="Add note..."
                      className="w-full bg-transparent border-b border-transparent hover:border-white/10 focus:border-blue-500/50 text-sm text-zinc-200 outline-none transition-colors"
                    />
                  </td>

                  <td className="px-8 py-5">
                    {/* Fixed Select: Added dark background to options */}
                    <select
                      value={labels[item.id] || ""}
                      onChange={(e) => handleLabelChange(item.id, e.target.value)}
                      className="w-full bg-transparent text-sm text-zinc-300 outline-none cursor-pointer"
                    >
                      <option value="" className="bg-zinc-900 text-zinc-400">Select Label</option>
                      <option value="sarcasm" className="bg-zinc-900 text-zinc-200">Sarcasm</option>
                      <option value="negative" className="bg-zinc-900 text-zinc-200">Negative</option>
                      <option value="positive" className="bg-zinc-900 text-zinc-200">Positive</option>
                      <option value="neutral" className="bg-zinc-900 text-zinc-200">Neutral</option>
                    </select>
                  </td>

                  <td className="px-8 py-5 text-center">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}

              {queue.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-32 text-center text-zinc-500">
                    <Check className="w-10 h-10 mx-auto text-green-500 mb-4" />
                    All caught up!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Push Button (Fixed Color) */}
        <AnimatePresence>
          {queue.length > 0 && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="fixed bottom-10 right-10 z-50"
            >
              <button
                onClick={handlePushAll}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/20 flex items-center gap-3 transition-all"
              >
                Push Verified Data
                <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-xs">
                  {queue.length}
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

// --- 5. STRATEGIC INSIGHTS COMPONENT (Increased Top Spacing) ---
function StrategicInsights() {
  const [stats, setStats] = useState({ total_processed: 0, human_review_count: 0, auto_resolved: 0, critical_count: 0, growth_rate: "..." });
  
  const [strategyData, setStrategyData] = useState<{
    top_issues: { issue: string; count: number; severity: string }[];
    remediation_plan: string;
  } | null>(null);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Persistence Logic
  useEffect(() => {
    const savedStats = sessionStorage.getItem("strat_stats");
    const savedReport = sessionStorage.getItem("strat_report");

    if (savedStats) setStats(JSON.parse(savedStats));
    if (savedReport && savedReport !== "null" && savedReport !== "undefined") {
        try { setStrategyData(JSON.parse(savedReport)); } catch (e) { console.error(e); }
    }
    
    if (!savedReport || savedReport === "null") fetchData();
  }, []);

  useEffect(() => {
    if (strategyData) sessionStorage.setItem("strat_report", JSON.stringify(strategyData));
    sessionStorage.setItem("strat_stats", JSON.stringify(stats));
  }, [strategyData, stats]);

  const fetchData = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const statsRes = await fetch("http://localhost:8000/stats");
      if (statsRes.ok) setStats(await statsRes.json());
      
      const reportRes = await fetch("http://localhost:8000/generate-report");
      if (reportRes.ok) {
        const json = await reportRes.json();
        if (json.report && json.report.top_issues && Array.isArray(json.report.top_issues)) {
            setStrategyData(json.report);
            setStatusMsg("Updated");
            setTimeout(() => setStatusMsg(null), 3000);
        } else {
            setStatusMsg("AI Busy - Retaining Data");
            setTimeout(() => setStatusMsg(null), 3000);
        }
      }
    } catch (error) {
      setStatusMsg("Connection Failed");
      setTimeout(() => setStatusMsg(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (sev: string) => {
    const s = (sev || "").toLowerCase();
    if (s.includes("high")) return "bg-red-500";
    if (s.includes("medium")) return "bg-orange-500";
    return "bg-blue-500";
  };

  const cleanText = (text: string) => {
    if (!text) return "";
    return text.replace(/\*\*/g, "").replace(/###/g, "").replace(/- /g, "• ").trim();
  };

  const maxCount = strategyData?.top_issues.reduce((max, item) => Math.max(max, item.count), 0) || 1;

  return (
    // UPDATED: Changed py-8 to py-12 for more top spacing
    <div className="min-h-[calc(100vh-3.5rem)] px-6 py-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Floating Status Toast (Top Right) */}
        {statusMsg && (
            <div className="fixed top-24 right-10 z-50">
                <span className="text-xs text-zinc-400 font-mono animate-pulse bg-zinc-900/80 px-3 py-1 rounded-full border border-white/10">
                    {statusMsg}
                </span>
            </div>
        )}

        {/* ZONE A: KEY METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/10">
            <div className="flex items-center gap-2 mb-1 text-zinc-500 text-xs font-bold uppercase tracking-wider"><BarChart3 className="w-4 h-4" /> Total Volume</div>
            <div className="text-3xl font-mono font-bold text-white">{stats.total_processed}</div>
          </div>
          
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/10">
            <div className="flex items-center gap-2 mb-1 text-zinc-500 text-xs font-bold uppercase tracking-wider"><Zap className="w-4 h-4 text-green-400" /> Efficiency</div>
            <div className="text-3xl font-mono font-bold text-white">{stats.auto_resolved} <span className="text-sm text-zinc-500 font-sans font-normal">Auto-Resolved</span></div>
          </div>

          <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/10">
            <div className="flex items-center gap-2 mb-1 text-zinc-500 text-xs font-bold uppercase tracking-wider"><AlertTriangle className="w-4 h-4 text-red-400" /> Critical Issues</div>
            <div className="text-3xl font-mono font-bold text-white text-red-400">{stats.critical_count}</div>
          </div>

          <div className="p-5 rounded-xl bg-zinc-900/40 border border-white/10">
            <div className="flex items-center gap-2 mb-1 text-zinc-500 text-xs font-bold uppercase tracking-wider"><Target className="w-4 h-4 text-purple-400" /> Issue Mentions</div>
            <div className="text-3xl font-mono font-bold text-white">
                {strategyData ? strategyData.top_issues.reduce((acc, curr) => acc + curr.count, 0) : 0}
            </div>
          </div>
        </div>

        {/* ZONE B & C GRID - 50:50 RATIO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* ZONE B: RISK RADAR (50% Width) */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col h-full">
                <div className="text-center pb-3">
                    <h2 className="text-lg font-semibold text-white">Risk Radar</h2>
                </div>
                
                <div className="flex-1 p-6 rounded-xl bg-zinc-900/40 border border-white/10 flex flex-col justify-center min-h-[320px]">
                    {loading && !strategyData ? (
                        <div className="h-full flex items-center justify-center opacity-30"><BarChart3 className="w-12 h-12 animate-pulse" /></div>
                    ) : strategyData?.top_issues ? (
                        <div className="flex flex-col justify-between h-full py-2 gap-6">
                            {strategyData.top_issues.map((issue, idx) => (
                                <div key={idx} className="group">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-zinc-200">{issue.issue}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide ${
                                            issue.severity === 'High' ? 'text-red-400 bg-red-400/10' : 
                                            issue.severity === 'Medium' ? 'text-orange-400 bg-orange-400/10' : 
                                            'text-blue-400 bg-blue-400/10'
                                        }`}>
                                            {issue.severity}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(issue.count / maxCount) * 100}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className={`h-full rounded-full ${getSeverityColor(issue.severity)}`}
                                        />
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-1.5 text-right">{issue.count} occurrences</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-2">
                            <p className="text-sm">No data available.</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* ZONE C: RECOMMENDED ACTION PLAN (50% Width) */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col h-full">
                <div className="text-center pb-3">
                    <h2 className="text-lg font-semibold text-white">Recommended Action Plan</h2>
                </div>
                
                <div className="flex-1 p-8 rounded-xl bg-zinc-900/40 border border-white/10 relative overflow-hidden min-h-[320px]">
                    {loading && !strategyData ? (
                        <div className="h-full flex items-center justify-center opacity-30"><Sparkles className="w-12 h-12 animate-spin" /></div>
                    ) : (
                        <div className="h-full flex flex-col">
                            <div className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed whitespace-pre-line flex-grow">
                                {cleanText(strategyData?.remediation_plan || "No plan generated.")}
                            </div>
                            
                            {/* REFRESH BUTTON (Bottom Center) */}
                            {/* UPDATED: Changed justify-end to justify-center */}
                            <div className="flex justify-center mt-6">
                                <button 
                                    onClick={fetchData} 
                                    disabled={loading} 
                                    className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all border ${
                                        loading 
                                        ? "bg-zinc-800/50 text-zinc-500 cursor-not-allowed" 
                                        : "bg-zinc-800 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white hover:border-white/20"
                                    }`}
                                >
                                    {/* UPDATED: Removed the Sparkles icon */}
                                    {loading ? "Regenerating..." : "Refresh Analysis"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

        </div>
      </div>
    </div>
  )
}

// --- 6. MAIN APP COMPONENT (Final Branding Polish) ---
export default function App() {
  const [activeTab, setActiveTab] = useState("user-dashboard")
  
  const tabs = [
    { id: "user-dashboard", label: "User Dashboard", icon: Sparkles },
    { id: "batch", label: "Batch Processing", icon: Layers },
    { id: "annotator", label: "Annotator Workspace", icon: Users },
    { id: "strategy", label: "Strategic Insights", icon: BarChart3 },
  ]

  return (
    <div className="dark"> 
      <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-blue-500/30">
        <div className="fixed inset-0 overflow-hidden pointer-events-none"><div className="aurora-gradient" /></div>
        
        {/* HEADER */}
        <header className="sticky top-0 z-50 h-16 backdrop-blur-xl bg-zinc-950/50 border-b border-white/5">
          <div className="h-full max-w-6xl mx-auto px-6 flex items-center justify-between">
            
            {/* Left: Logo */}
            <div className="flex items-center gap-3">
                <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                  SmartSift
                </span>
            </div>

            {/* Center: Nav Links */}
            <nav className="flex items-center gap-8">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="relative flex items-center gap-2 text-sm font-medium transition-colors py-1 group">
                    <span className={`transition-colors ${isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"}`}>{tab.label}</span>
                    {isActive && (<motion.div layoutId="active-indicator" className="absolute -bottom-[21px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" transition={{ type: "spring", stiffness: 380, damping: 30 }} />)}
                  </button>
                )
              })}
            </nav>

            {/* Right Side: Digithon Branding */}
            <div className="flex items-center gap-4">
              {/* UPDATED: All Caps + SmartSift Gradient Style */}
              <span className="text-sm font-bold tracking-wide bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                DIGITHON 2025
              </span>
              
              <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center p-1 overflow-hidden border border-white/10">
                 <img 
                    src="/iitg-logo.png" 
                    alt="IITG" 
                    className="w-full h-full object-contain"
                    style={{ transform: "scale(1.7)" }} 
                    onError={(e) => {
                        e.currentTarget.style.display = 'none'; 
                    }}
                 />
              </div>
            </div> 
          </div>
        </header>

        <main className="relative">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {activeTab === "user-dashboard" && <UserDashboard />}
              {activeTab === "batch" && <BatchProcessing />}
              {activeTab === "annotator" && <AnnotatorWorkspace />}
              {activeTab === "strategy" && <StrategicInsights />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}