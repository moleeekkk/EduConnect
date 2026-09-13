/**
 * Helper to read a local File object into a base64 Data URL for instant in-app previews.
 */
export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * Helper to convert Base64 Data URL to Blob object.
 */
export const dataURLtoBlob = (dataurl) => {
  if (!dataurl || typeof dataurl !== "string" || !dataurl.startsWith("data:")) {
    return null;
  }
  try {
    const arr = dataurl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (err) {
    console.error("Error converting Data URL to Blob:", err);
    return null;
  }
};

/**
 * Creates a blob URL from a Data URL or returns the original string if not a Data URL.
 */
export const createBlobUrl = (fileSource) => {
  if (!fileSource || typeof fileSource !== "string") return fileSource;
  if (fileSource.startsWith("data:")) {
    const blob = dataURLtoBlob(fileSource);
    if (blob) {
      return URL.createObjectURL(blob);
    }
  }
  return fileSource;
};

/**
 * Clean helper to return a user-friendly display filename.
 * Prevents raw data:application/pdf;base64,... strings from appearing in the UI.
 */
export const getDisplayFileName = (fileName, attachment, fallbackTitle = "Document") => {
  if (fileName && typeof fileName === "string" && !fileName.startsWith("data:")) {
    const clean = fileName.split("/").pop().split("\\").pop();
    if (clean && clean.trim().length > 0) return clean;
  }

  if (attachment && typeof attachment === "string" && !attachment.startsWith("data:")) {
    const clean = attachment.split("/").pop().split("\\").pop();
    if (clean && clean.trim().length > 0) return clean;
  }

  if (attachment && typeof attachment === "string" && attachment.startsWith("data:")) {
    const mimeMatch = attachment.match(/^data:([^;]+);/);
    let ext = ".pdf";
    if (mimeMatch) {
      const mime = mimeMatch[1].toLowerCase();
      if (mime.includes("image/png")) ext = ".png";
      else if (mime.includes("image/jpeg") || mime.includes("image/jpg")) ext = ".jpg";
      else if (mime.includes("image/gif")) ext = ".gif";
      else if (mime.includes("image/svg")) ext = ".svg";
      else if (mime.includes("zip")) ext = ".zip";
      else if (mime.includes("word") || mime.includes("document")) ext = ".docx";
    }

    const safeTitle = (fallbackTitle || "Assignment_Document")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/_+/g, "_");

    return safeTitle.endsWith(ext) ? safeTitle : `${safeTitle}${ext}`;
  }

  return fallbackTitle || "Document.pdf";
};

/**
 * Triggers clean download for Data URLs, Blob URLs, or remote file paths.
 */
export const downloadFile = (fileUrl, fileName = "Document") => {
  if (!fileUrl) return;

  const cleanName = getDisplayFileName(fileName, fileUrl, "Document");

  if (fileUrl.startsWith("data:")) {
    const blob = dataURLtoBlob(fileUrl);
    if (blob) {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = cleanName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      return;
    }
  }

  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = cleanName;
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

/**
 * Safely opens a file in a new tab without popup blocker errors or empty iframe issues.
 */
export const openFileInNewTab = (fileUrl, title = "Study Material Document") => {
  if (!fileUrl) return;

  if (typeof fileUrl === "string" && fileUrl.startsWith("data:")) {
    const blob = dataURLtoBlob(fileUrl);
    if (blob) {
      const blobUrl = URL.createObjectURL(blob);
      const win = window.open(blobUrl, "_blank");
      if (!win) {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      return;
    }
  }

  if (typeof fileUrl === "string" && (fileUrl.startsWith("http://") || fileUrl.startsWith("https://") || fileUrl.startsWith("blob:"))) {
    const win = window.open(fileUrl, "_blank", "noopener,noreferrer");
    if (!win) {
      const a = document.createElement("a");
      a.href = fileUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    return;
  }

  // Fallback for mock relative file paths like "/resources/study_material_doc.pdf"
  const cleanName = getDisplayFileName(null, fileUrl, title);
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${title} - Document Viewer</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; box-sizing: border-box; }
          .container { background: #1e293b; padding: 40px; border-radius: 20px; border: 1px solid #334155; max-width: 640px; width: 100%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
          .icon-box { background: rgba(56,189,248,0.1); width: 80px; height: 80px; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; border: 1px solid rgba(56,189,248,0.2); }
          .icon { font-size: 40px; }
          .badge { display: inline-block; background: #0284c7; color: #ffffff; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 6px 14px; border-radius: 9999px; margin-bottom: 16px; }
          h1 { font-size: 22px; margin: 0 0 10px; font-weight: 800; color: #f8fafc; line-height: 1.3; }
          p { color: #94a3b8; font-size: 14px; margin: 0 0 24px; line-height: 1.6; }
          .file-pill { background: #0f172a; padding: 14px 18px; border-radius: 12px; border: 1px solid #334155; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #38bdf8; font-size: 13px; word-break: break-all; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; }
          .footer-note { font-size: 12px; color: #64748B; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="badge">EduConnect Course Resource</div>
          <div class="icon-box"><span class="icon">📄</span></div>
          <h1>${title}</h1>
          <p>Official course study material uploaded by department faculty.</p>
          <div class="file-pill"><span>📎</span> ${cleanName}</div>
          <div class="footer-note">EduConnect Academic Portal • Resource Viewer</div>
        </div>
      </body>
    </html>
  `;
  const blob = new Blob([htmlContent], { type: "text/html" });
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, "_blank");
};

