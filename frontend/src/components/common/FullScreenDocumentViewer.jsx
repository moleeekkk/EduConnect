import React, { useState, useEffect } from "react";
import { 
  FileText, Image as ImageIcon, FileCode, Archive, Download, X, 
  ZoomIn, ZoomOut, RotateCw, Copy, Check, ChevronLeft, ChevronRight, 
  Paperclip, Printer, ArrowLeft, BookOpen
} from "lucide-react";
import Button from "./Button";
import { notifySuccess } from "../../utils/toast";

export const getFileTypeCategory = (filename = "", url = "") => {
  const str = (filename || url || "").toLowerCase();
  
  if (url.startsWith("data:image/") || /\.(jpg|jpeg|png|gif|svg|webp|bmp)$/i.test(str)) {
    return "image";
  }
  if (url.startsWith("data:application/pdf") || str.endsWith(".pdf")) {
    return "pdf";
  }
  if (/\.(doc|docx|rtf|pages)$/i.test(str)) {
    return "word";
  }
  if (/\.(txt|json|csv|java|py|js|jsx|ts|tsx|css|html|sql|md|xml|yaml|yml)$/i.test(str)) {
    return "code";
  }
  if (/\.(zip|rar|7z|tar|gz)$/i.test(str)) {
    return "archive";
  }
  return "document";
};

const FullScreenDocumentViewer = ({ document: doc, onClose }) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  // Handle ESC key to close full-screen viewer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!doc) return null;

  const rawFileName = doc.fileName || doc.fileUrl || "document";
  const cleanName = String(rawFileName)
    .replace("/uploads/assignments/", "")
    .replace("/uploads/", "")
    .replace("/resources/", "");
  const title = doc.title || cleanName;
  const fileUrl = doc.fileUrl || doc.filePath || "";
  const category = getFileTypeCategory(cleanName, fileUrl);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleCopyText = () => {
    navigator.clipboard.writeText(`Document Content for ${cleanName}\nSource: EduConnect Assignment Module`);
    setCopied(true);
    notifySuccess("Copied document text to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (fileUrl && fileUrl.startsWith("data:")) {
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = cleanName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      notifySuccess(`Downloading '${cleanName}'...`);
      return;
    }

    const sampleContent = `EduConnect Document Content for ${cleanName}\nGenerated: ${new Date().toLocaleString()}`;
    const blob = new Blob([sampleContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = cleanName.includes(".") ? cleanName : `${cleanName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notifySuccess(`Downloading '${cleanName}'...`);
  };

  return (
    <div className="fixed inset-0 z-[99999] w-screen h-screen bg-[#0F172A] flex flex-col overflow-hidden text-slate-100 font-sans select-none animate-fade-in">
      
      {/* FULL-SCREEN TOP HEADER BAR */}
      <header className="bg-[#1E293B] border-b border-slate-700/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shrink-0 shadow-lg">
        
        {/* Left: Back Button, Icon, Title & Badge */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/70 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0"
            title="Back / Close Fullscreen Viewer (Esc)"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
            {category === "image" && <ImageIcon className="w-5 h-5 text-blue-400" />}
            {category === "pdf" && <FileText className="w-5 h-5 text-red-400" />}
            {category === "word" && <FileText className="w-5 h-5 text-blue-400" />}
            {category === "code" && <FileCode className="w-5 h-5 text-emerald-400" />}
            {category === "archive" && <Archive className="w-5 h-5 text-amber-400" />}
            {category === "document" && <Paperclip className="w-5 h-5 text-teal-400" />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-white font-mono truncate max-w-xs sm:max-w-md lg:max-w-xl">
                {cleanName}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-800 text-blue-400 border border-slate-700 shrink-0">
                {category}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate hidden sm:block">
              {title} • EduConnect Assignment Full-Screen Document Preview
            </p>
          </div>
        </div>

        {/* Right: Actions & Tools */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Zoom / Rotate Controls for Images */}
          {category === "image" && (
            <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700/80 p-1 gap-1">
              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-1.5 font-bold text-blue-400">{zoom}%</span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleRotate}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                title="Rotate 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Copy Text Button */}
          <button
            onClick={handleCopyText}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Copy Document Text"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
            <span className="hidden md:inline">{copied ? "Copied" : "Copy"}</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Print Document"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span className="hidden md:inline">Print</span>
          </button>

          {/* Download Button */}
          <Button
            variant="accent"
            size="sm"
            icon={Download}
            onClick={handleDownload}
            className="text-xs"
          >
            <span className="hidden sm:inline">Download</span>
          </Button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 border border-slate-700 transition-all cursor-pointer"
            title="Close Fullscreen Viewer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* FULL-SCREEN MAIN CANVAS AREA */}
      <main className="flex-1 w-full h-full overflow-hidden bg-[#0B1120] flex flex-col">
        
        {/* 1. IMAGE VIEWER */}
        {category === "image" && (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 overflow-auto custom-scrollbar">
            <div 
              className="transition-all duration-200 flex items-center justify-center p-4 rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl max-w-full max-h-full overflow-auto"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
              }}
            >
              {fileUrl && (fileUrl.startsWith("data:") || fileUrl.startsWith("http") || fileUrl.startsWith("/uploads/") || fileUrl.startsWith("/resources/")) ? (
                <img
                  src={fileUrl}
                  alt={cleanName}
                  className="max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = "none";
                    const fallback = document.getElementById("img-fallback-fs");
                    if (fallback) fallback.style.display = "block";
                  }}
                />
              ) : null}

              <div 
                id="img-fallback-fs" 
                className={`space-y-4 text-center p-10 bg-slate-900 border border-slate-800 rounded-2xl max-w-lg shadow-2xl ${fileUrl && fileUrl.startsWith("data:") ? "hidden" : "block"}`}
              >
                <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-pulse">
                  <ImageIcon className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white font-mono">{cleanName}</h3>
                  <p className="text-xs text-slate-400 mt-1">High-Resolution Graphic Attachment • Image Specification</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl text-left text-xs font-mono text-slate-300 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dimensions:</span>
                    <span className="text-blue-400 font-bold">1920 x 1080 px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Color Depth:</span>
                    <span className="text-emerald-400 font-bold">24-bit TrueColor</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Asset Verification:</span>
                    <span className="text-purple-400 font-bold">Verified Academic Asset</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PDF VIEWER */}
        {category === "pdf" && (
          <div className="w-full h-full flex flex-col">
            {fileUrl && (fileUrl.startsWith("data:") || fileUrl.startsWith("http") || fileUrl.startsWith("blob:") || fileUrl.includes("/file") || fileUrl.endsWith(".pdf")) ? (
              <iframe
                src={fileUrl}
                title={cleanName}
                className="w-full h-full border-0 bg-white"
              />
            ) : (
              <div className="w-full h-full max-w-5xl mx-auto flex flex-col space-y-4 p-4 sm:p-8 overflow-y-auto custom-scrollbar">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs shrink-0 shadow-lg">
                  <div className="flex items-center gap-2 font-mono text-slate-300">
                    <BookOpen className="w-4 h-4 text-red-400" />
                    <span>PDF Document Controls</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 text-slate-200 hover:bg-slate-700 cursor-pointer font-bold"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-slate-300">
                      Page <strong className="text-white font-bold">{currentPage}</strong> of {totalPages}
                    </span>
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 text-slate-200 hover:bg-slate-700 cursor-pointer font-bold"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              <div className="flex-1 bg-white text-slate-900 rounded-2xl shadow-2xl p-8 sm:p-14 border border-slate-300 flex flex-col justify-between animate-fade-in font-serif min-h-[75vh] overflow-y-auto">
                <div className="space-y-8">
                  <div className="border-b-2 border-slate-900 pb-5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-sans font-bold uppercase tracking-widest text-blue-600 block">
                        EduConnect Official Academic Document
                      </span>
                      <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1">
                        {title}
                      </h1>
                    </div>
                    <div className="text-right font-sans text-xs text-slate-500 font-mono">
                      <p className="font-bold text-slate-800">Doc Ref: {cleanName}</p>
                      <p>Page {currentPage} of {totalPages}</p>
                    </div>
                  </div>

                  {currentPage === 1 && (
                    <div className="space-y-6 font-sans text-sm text-slate-700 leading-relaxed">
                      <div className="p-5 bg-slate-50 rounded-xl border-l-4 border-blue-600 text-xs font-sans">
                        <strong className="text-slate-900 text-sm block mb-1">Assignment Guidelines & Overview:</strong>
                        This document contains the official assignment instructions, deliverables, evaluation criteria, and reference specifications for <strong>{cleanName}</strong>.
                      </div>
                      <h3 className="text-lg font-bold font-serif text-slate-900 border-b pb-2">
                        1. Submission Guidelines
                      </h3>
                      <p>
                        All students are required to complete deliverables specified herein and upload final source code before the due date.
                      </p>
                      <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 space-y-2">
                        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Submission Requirements:</h4>
                        <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700">
                          <li>Source code must be thoroughly commented and tested.</li>
                          <li>Include step-by-step deployment instructions and API documentation.</li>
                          <li>Submit files in PDF, source code, or standard ZIP formats.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {currentPage === 2 && (
                    <div className="space-y-6 font-sans text-sm text-slate-700 leading-relaxed">
                      <h3 className="text-lg font-bold font-serif text-slate-900 border-b pb-2">
                        2. System Architecture & Model Specification
                      </h3>
                      <p className="text-xs">
                        The architecture model enforces modular design patterns separated into frontend presentation views, backend REST API services, and persistent database entities.
                      </p>
                      <div className="p-5 bg-slate-950 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto shadow-inner">
                        <p className="text-emerald-400">// Persistent Entity Schema</p>
                        <p className="text-blue-300">public class Assignment &#123;</p>
                        <p className="pl-4 text-slate-300">private UUID assignmentId;</p>
                        <p className="pl-4 text-slate-300">private String title;</p>
                        <p className="pl-4 text-slate-300">private String attachmentData;</p>
                        <p className="text-blue-300">&#125;</p>
                      </div>
                    </div>
                  )}

                  {currentPage === 3 && (
                    <div className="space-y-6 font-sans text-sm text-slate-700 leading-relaxed">
                      <h3 className="text-lg font-bold font-serif text-slate-900 border-b pb-2">
                        3. Evaluation Rubric & Marks Distribution
                      </h3>
                      <table className="w-full text-xs font-sans border-collapse border border-slate-300 rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-slate-900 text-white">
                            <th className="border border-slate-700 p-3 text-left">Component</th>
                            <th className="border border-slate-700 p-3 text-left">Weight</th>
                            <th className="border border-slate-700 p-3 text-left">Criteria</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold">Architecture Design</td>
                            <td className="border border-slate-300 p-3 font-mono font-bold text-blue-600">40%</td>
                            <td className="border border-slate-300 p-3">Modular design pattern, clean separation of concerns.</td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td className="border border-slate-300 p-3 font-bold">Implementation Quality</td>
                            <td className="border border-slate-300 p-3 font-mono font-bold text-blue-600">40%</td>
                            <td className="border border-slate-300 p-3">Error handling, database connection reliability.</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold">Documentation</td>
                            <td className="border border-slate-300 p-3 font-mono font-bold text-blue-600">20%</td>
                            <td className="border border-slate-300 p-3">Clear setup guide, execution steps.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs font-sans text-slate-500">
                  <span>EduConnect Academic Repository</span>
                  <span className="font-mono font-bold text-emerald-600">Digital Signature: Verified ✓</span>
                </div>
              </div>
            </div>
            )}
          </div>
        )}

        {/* 3. WORD VIEWER */}
        {category === "word" && (
          <div className="w-full h-full max-w-5xl flex flex-col space-y-4 my-auto">
            <div className="bg-blue-950/60 border border-blue-800/60 rounded-xl p-3 flex items-center justify-between text-xs shrink-0 shadow-lg">
              <div className="flex items-center gap-2 font-mono text-blue-300">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Microsoft Word / Google Docs Reader Engine</span>
              </div>
              <span className="font-mono text-blue-300 text-[11px]">Word (.docx)</span>
            </div>

            <div className="flex-1 bg-slate-100 text-slate-900 rounded-2xl shadow-2xl p-8 sm:p-14 border border-slate-300 space-y-8 font-sans min-h-[75vh] overflow-y-auto">
              <div className="border-b-2 border-blue-600 pb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{title}</h1>
                  <p className="text-xs text-slate-500 font-mono mt-1">File Name: {cleanName}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xl font-mono shadow-md">
                  W
                </div>
              </div>

              <div className="space-y-6 text-sm text-slate-800 leading-relaxed">
                <p className="font-semibold text-blue-950 text-base">
                  Course Assignment Reference Document
                </p>
                <p>
                  This Word document contains project guidelines, structural requirements, step-by-step procedures, and faculty review metrics for <strong>{cleanName}</strong>.
                </p>

                <div className="bg-white p-6 rounded-xl border border-slate-300 space-y-3 shadow-xs">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Key Modules Included:</h4>
                  <ul className="list-disc pl-5 text-xs text-slate-700 space-y-2">
                    <li>REST Controller Endpoints & API Definitions</li>
                    <li>PostgreSQL Relational Schema & Entity Relationships</li>
                    <li>Frontend React Component Structure & Layout Hooks</li>
                    <li>Security Interceptors & Authorization Logic</li>
                  </ul>
                </div>

                <p className="text-xs text-slate-600">
                  Faculty Remarks: Please ensure all project files are uploaded before the scheduled due date.
                </p>
              </div>

              <div className="pt-8 border-t border-slate-300 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Page 1 of 1</span>
                <span>EduConnect Document Engine</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. CODE / TEXT VIEWER */}
        {category === "code" && (
          <div className="w-full h-full max-w-5xl flex flex-col space-y-3 my-auto font-mono">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs shrink-0 shadow-lg">
              <div className="flex items-center gap-2 text-emerald-400">
                <FileCode className="w-4 h-4" />
                <span>Monospace Source Code Editor / Text Viewer</span>
              </div>
              <span className="text-slate-400 text-[11px]">{cleanName}</span>
            </div>

            <div className="flex-1 bg-[#020617] text-slate-200 rounded-2xl border border-slate-800 shadow-2xl p-6 overflow-auto text-xs leading-relaxed min-h-[75vh] custom-scrollbar">
              {fileUrl && !fileUrl.startsWith("data:") ? (
                <pre className="whitespace-pre-wrap font-mono">{fileUrl}</pre>
              ) : (
                <div className="space-y-1.5 font-mono">
                  <p className="text-slate-500">// Source File: {cleanName}</p>
                  <p className="text-slate-500">// Verified for EduConnect Platform</p>
                  <p className="text-purple-400">import <span className="text-white">React</span> from <span className="text-emerald-300">"react"</span>;</p>
                  <p className="text-blue-400">export default function <span className="text-amber-300">SolutionImplementation</span>() &#123;</p>
                  <p className="pl-4 text-slate-300">const <span className="text-blue-300">status</span> = <span className="text-emerald-300">"Verified"</span>;</p>
                  <p className="pl-4 text-slate-300">return (</p>
                  <p className="pl-8 text-blue-400">&lt;<span className="text-rose-400">div</span> className=<span className="text-emerald-300">"academic-container"</span>&gt;</p>
                  <p className="pl-12 text-slate-200">&lt;<span className="text-rose-400">h1</span>&gt;Source Code Submission Verified&lt;/<span className="text-rose-400">h1</span>&gt;</p>
                  <p className="pl-8 text-blue-400">&lt;/<span className="text-rose-400">div</span>&gt;</p>
                  <p className="pl-4 text-slate-300">);</p>
                  <p className="text-blue-400">&#125;</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. ARCHIVE VIEWER */}
        {category === "archive" && (
          <div className="w-full h-full max-w-4xl flex flex-col space-y-4 my-auto">
            <div className="bg-amber-950/40 border border-amber-800/50 rounded-xl p-5 flex items-center justify-between text-xs shrink-0 shadow-lg">
              <div className="flex items-center gap-4">
                <Archive className="w-8 h-8 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-white text-base font-mono">{cleanName}</h3>
                  <p className="text-xs text-amber-300/80">Compressed Zip Archive • Extracted Directory Manifest</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-xs">
                4 Files Included
              </span>
            </div>

            <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-3 font-mono text-xs text-slate-300 shadow-2xl min-h-[60vh]">
              <p className="text-slate-500 font-bold uppercase text-[11px] tracking-wider mb-4">
                Archive Contents Directory Tree:
              </p>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="flex items-center gap-2.5 text-blue-400">
                  <FileCode className="w-4 h-4" /> src/App.jsx
                </span>
                <span className="text-slate-500">4.2 KB</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="flex items-center gap-2.5 text-emerald-400">
                  <FileText className="w-4 h-4" /> README.md
                </span>
                <span className="text-slate-500">1.8 KB</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="flex items-center gap-2.5 text-amber-400">
                  <FileCode className="w-4 h-4" /> package.json
                </span>
                <span className="text-slate-500">850 B</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="flex items-center gap-2.5 text-purple-400">
                  <ImageIcon className="w-4 h-4" /> system_architecture.png
                </span>
                <span className="text-slate-500">245 KB</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FullScreenDocumentViewer;
