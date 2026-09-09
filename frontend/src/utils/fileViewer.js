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
export const openFileInNewTab = (fileUrl, title = "Document Preview") => {
  if (!fileUrl) return;

  if (fileUrl.startsWith("data:")) {
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
};

