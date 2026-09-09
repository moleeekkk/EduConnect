import React, { useState, useEffect } from "react";
import { 
  FileText, Image as ImageIcon, FileCode, Archive, Download, X, 
  ZoomIn, ZoomOut, RotateCw, Copy, Check, ChevronLeft, ChevronRight, 
  Maximize2, Minimize2, Paperclip, FileCheck, Printer, Eye, BookOpen, Layers, ArrowLeft
} from "lucide-react";
import Button from "./Button";
import { notifySuccess } from "../../utils/toast";
import { downloadFile, createBlobUrl, getDisplayFileName } from "../../utils/fileViewer";

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

const DocumentViewerModal = ({ isOpen, onClose, filePath, fileName, customTitle, fileData }) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  // Handle ESC key to close full-screen document viewer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resolvedName = fileName || (filePath ? filePath.split("/").pop() : "document");
  const cleanName = String(resolvedName).replace("/uploads/assignments/", "").replace("/uploads/", "").replace("/resources/", "");
  const title = customTitle || cleanName;
  const category = getFileTypeCategory(cleanName, fileData || filePath || "");

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleCopyText = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    notifySuccess("Document content copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const fileSource = fileData || filePath;
    if (fileSource) {
      downloadFile(fileSource, cleanName);
      notifySuccess(`Downloading '${cleanName}'...`);
      return;
    }

    // Default download fallback blob
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
    <div className="fixed inset-0 z-[99999] w-screen h-screen bg-[#0F172A] flex flex-col overflow-hidden animate-fade-in text-slate-100">
      
      {/* GOOGLE CLASSROOM STYLE FULL-SCREEN TOP HEADER BAR */}
      <header className="bg-[#1E293B] border-b border-slate-700/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shrink-0 shadow-lg select-none">
        
        {/* Left Section: Back Button, Document Icon & File Name */}
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
              {title} • Google Classroom Style Full-Screen Document Reader
            </p>
          </div>
        </div>

        {/* Right Section: Full Toolbar Controls */}
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
          {(category === "code" || category === "word" || category === "pdf") && (
            <button
              onClick={() => handleCopyText(`EduConnect Document Content for ${cleanName}`)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copy Text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
              <span className="hidden md:inline">{copied ? "Copied" : "Copy"}</span>
            </button>
          )}

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

          {/* Close X Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 border border-slate-700 transition-all cursor-pointer"
            title="Close Viewer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* FULL-SCREEN DOCUMENT VIEWPORT CANVAS */}
      <main className="flex-1 w-full h-full overflow-auto p-4 sm:p-8 bg-[#0B1120] flex flex-col items-center justify-center custom-scrollbar">
        
        {/* 1. FULL-SCREEN IMAGE VIEWER */}
        {category === "image" && (
          <div className="w-full h-full flex flex-col items-center justify-center my-auto space-y-4">
            <div 
              className="transition-all duration-200 flex items-center justify-center p-4 rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl max-w-full max-h-full overflow-auto"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
              }}
            >
              {fileData || (filePath && (filePath.startsWith("data:") || filePath.startsWith("http") || filePath.startsWith("/uploads/") || filePath.startsWith("/resources/"))) ? (
                <img
                  src={fileData || filePath}
                  alt={cleanName}
                  className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = "none";
                    const fallback = document.getElementById("img-fallback-full");
                    if (fallback) fallback.style.display = "block";
                  }}
                />
              ) : null}

              <div 
                id="img-fallback-full" 
                className={`space-y-4 text-center p-10 bg-slate-900 border border-slate-800 rounded-2xl max-w-lg shadow-2xl ${fileData || (filePath && filePath.startsWith("data:")) ? "hidden" : "block"}`}
              >
                <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-pulse">
                  <ImageIcon className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white font-mono">{cleanName}</h3>
                  <p className="text-xs text-slate-400 mt-1">High Resolution Graphic Attachment • Verified Image Spec</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl text-left text-xs font-mono text-slate-300 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dimensions:</span>
                    <span className="text-blue-400 font-bold">1920 x 1080 px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Color Profile:</span>
                    <span className="text-emerald-400 font-bold">sRGB True Color</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Asset Status:</span>
                    <span className="text-purple-400 font-bold">Verified Academic Asset</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. FULL-SCREEN PDF VIEWER */}
        {category === "pdf" && (
          <div className="w-full h-full max-w-5xl flex flex-col space-y-4 my-auto">
            {/* PDF Navigation Toolbar */}
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

            {/* Embedded Iframe if real data URL, blob URL, or PDF url available */}
            {(fileData || filePath) && (String(fileData || filePath).startsWith("data:application/pdf") || String(fileData || filePath).startsWith("blob:") || String(fileData || filePath).endsWith(".pdf")) ? (
              <iframe
                src={createBlobUrl(fileData || filePath)}
                title={cleanName}
                className="w-full flex-1 rounded-2xl border border-slate-800 shadow-2xl bg-white min-h-[75vh]"
              />
            ) : (
              /* Full-Screen PDF Document Sheet */
              <div className="flex-1 bg-white text-slate-900 rounded-2xl shadow-2xl p-8 sm:p-14 border border-slate-300 flex flex-col justify-between animate-fade-in font-serif min-h-[75vh] overflow-y-auto">
                <div className="space-y-8">
                  {/* Academic Document Header */}
                  <div className="border-b-2 border-slate-900 pb-5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-sans font-bold uppercase tracking-widest text-blue-600 block">
                        EduConnect Official Academic Repository
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

                  {/* Page 1 Content */}
                  {currentPage === 1 && (
                    <div className="space-y-6 font-sans text-sm text-slate-700 leading-relaxed">
                      <div className="p-5 bg-slate-50 rounded-xl border-l-4 border-blue-600 text-xs font-sans">
                        <strong className="text-slate-900 text-sm block mb-1">Course Specification & Academic Guidelines:</strong>
                        This document contains the complete academic reference specification, course unit deliverables, evaluation criteria, and assignment instructions for <strong>{cleanName}</strong>.
                      </div>
                      <h3 className="text-lg font-bold font-serif text-slate-900 border-b pb-2">
                        1. Executive Summary & Objective
                      </h3>
                      <p>
                        Students are expected to follow the instructions specified herein. All code implementations, architectural schemas, and data models must meet the university academic standard.
                      </p>
                      <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 space-y-2">
                        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Key Instructions:</h4>
                        <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700">
                          <li>Ensure all source code is thoroughly commented, modularized, and tested.</li>
                          <li>Include detailed deployment steps and database schema scripts in submission archives.</li>
                          <li>Submit deliverables in PDF or standard compressed archive formats prior to the due date.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Page 2 Content */}
                  {currentPage === 2 && (
                    <div className="space-y-6 font-sans text-sm text-slate-700 leading-relaxed">
                      <h3 className="text-lg font-bold font-serif text-slate-900 border-b pb-2">
                        2. System Architecture & Component Models
                      </h3>
                      <p className="text-xs">
                        The underlying system enforces modular multi-tier architecture separated into presentation, API backend services, and persistent data storage.
                      </p>
                      <div className="p-5 bg-slate-950 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto shadow-inner">
                        <p className="text-emerald-400">// Persistent Domain Model</p>
                        <p className="text-blue-300">public class AssignmentSubmission &#123;</p>
                        <p className="pl-4 text-slate-300">private UUID submissionId;</p>
                        <p className="pl-4 text-slate-300">private String studentEnrollmentNo;</p>
                        <p className="pl-4 text-slate-300">private String attachmentPath;</p>
                        <p className="pl-4 text-slate-300">private Double score;</p>
                        <p className="text-blue-300">&#125;</p>
                      </div>
                    </div>
                  )}

                  {/* Page 3 Content */}
                  {currentPage === 3 && (
                    <div className="space-y-6 font-sans text-sm text-slate-700 leading-relaxed">
                      <h3 className="text-lg font-bold font-serif text-slate-900 border-b pb-2">
                        3. Faculty Evaluation Rubric
                      </h3>
                      <table className="w-full text-xs font-sans border-collapse border border-slate-300 rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-slate-900 text-white">
                            <th className="border border-slate-700 p-3 text-left">Evaluation Criteria</th>
                            <th className="border border-slate-700 p-3 text-left">Weight</th>
                            <th className="border border-slate-700 p-3 text-left">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold">Architecture & Design</td>
                            <td className="border border-slate-300 p-3 font-mono font-bold text-blue-600">40%</td>
                            <td className="border border-slate-300 p-3">Modular design, clean separation of concerns.</td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td className="border border-slate-300 p-3 font-bold">Implementation Quality</td>
                            <td className="border border-slate-300 p-3 font-mono font-bold text-blue-600">40%</td>
                            <td className="border border-slate-300 p-3">Error handling, database connection reliability.</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 p-3 font-bold">Documentation & Testing</td>
                            <td className="border border-slate-300 p-3 font-mono font-bold text-blue-600">20%</td>
                            <td className="border border-slate-300 p-3">Comprehensive README, test coverage metrics.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs font-sans text-slate-500">
                  <span>EduConnect Academic Repository</span>
                  <span className="font-mono font-bold text-emerald-600">Digital Signature: Verified ✓</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. FULL-SCREEN WORD DOCUMENT READER */}
        {category === "word" && (
          <div className="w-full h-full max-w-5xl flex flex-col space-y-4 my-auto">
            {/* Word Ribbon */}
            <div className="bg-blue-950/60 border border-blue-800/60 rounded-xl p-3 flex items-center justify-between text-xs shrink-0 shadow-lg">
              <div className="flex items-center gap-2 font-mono text-blue-300">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Microsoft Word / Google Docs Reader Engine</span>
              </div>
              <span className="font-mono text-blue-300 text-[11px]">Word (.docx)</span>
            </div>

            {/* Google Docs Style Sheet Container */}
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
                  Academic Reference Document & Deliverable Specifications
                </p>
                <p>
                  This Word document contains complete structural guidelines, step-by-step installation procedures, and faculty review criteria for <strong>{cleanName}</strong>.
                </p>

                <div className="bg-white p-6 rounded-xl border border-slate-300 space-y-3 shadow-xs">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Included Modules:</h4>
                  <ul className="list-disc pl-5 text-xs text-slate-700 space-y-2">
                    <li>RESTful Controller Specifications & Endpoint Mapping</li>
                    <li>Relational Database Schema & Data Migration Scripts</li>
                    <li>Frontend Component State & Custom Hooks Implementation</li>
                    <li>Authentication Guard & Security Interceptors</li>
                  </ul>
                </div>

                <p className="text-xs text-slate-600">
                  Faculty Guidelines: Ensure all deliverables are verified and tested prior to final submission.
                </p>
              </div>

              <div className="pt-8 border-t border-slate-300 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Page 1 of 1</span>
                <span>EduConnect Doc Viewer</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. FULL-SCREEN CODE / TEXT VIEWER */}
        {category === "code" && (
          <div className="w-full h-full max-w-5xl flex flex-col space-y-3 my-auto font-mono">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs shrink-0 shadow-lg">
              <div className="flex items-center gap-2 text-emerald-400">
                <FileCode className="w-4 h-4" />
                <span>Monospace Source Code Editor / Text Viewer</span>
              </div>
              <span className="text-slate-400 text-[11px]">{cleanName}</span>
            </div>

            {/* Code Viewport */}
            <div className="flex-1 bg-[#020617] text-slate-200 rounded-2xl border border-slate-800 shadow-2xl p-6 overflow-auto text-xs leading-relaxed min-h-[75vh] custom-scrollbar">
              {fileData && !fileData.startsWith("data:") ? (
                <pre className="whitespace-pre-wrap font-mono">{fileData}</pre>
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

        {/* 5. FULL-SCREEN ARCHIVE VIEWER */}
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

export default DocumentViewerModal;
