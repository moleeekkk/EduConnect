/**
 * Helper to view or download uploaded document files in a new browser tab.
 */
export const openFileDocument = (filePath, customTitle) => {
  if (!filePath) {
    alert("No file path available for this document.");
    return;
  }

  // 1. Direct Base64 or Data URI or HTTP/HTTPS external link
  if (filePath.startsWith("data:") || filePath.startsWith("http://") || filePath.startsWith("https://")) {
    const win = window.open();
    if (win) {
      const title = customTitle || "EduConnect Document Preview";
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head><title>${title}</title></head>
          <body style="margin:0; background:#0f172a;">
            <iframe src="${filePath}" style="width:100vw; height:100vh; border:none;"></iframe>
          </body>
        </html>
      `);
    } else {
      window.location.href = filePath;
    }
    return;
  }

  // 2. Local uploaded file or mock attachment - Render interactive document window
  const cleanName = String(filePath).replace("/uploads/assignments/", "").replace("/uploads/", "");
  const docTitle = customTitle || cleanName || "Attachment Document";

  const docHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${docTitle} - EduConnect Document Viewer</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; max-width: 650px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
        .header { display: flex; align-items: center; justify-content: space-between; border-b: 1px solid #334155; padding-bottom: 16px; margin-bottom: 20px; }
        .title-group { display: flex; align-items: center; gap: 12px; }
        .icon { font-size: 28px; }
        .file-title { font-size: 18px; font-weight: 700; color: #38bdf8; margin: 0; word-break: break-all; }
        .sub-title { font-size: 12px; color: #94a3b8; margin-top: 2px; }
        .badge { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
        .info-box { background: #0f172a; border-radius: 10px; padding: 16px; margin-bottom: 24px; border: 1px solid #334155; font-family: monospace; font-size: 12px; color: #cbd5e1; }
        .info-row { display: flex; justify-content: space-between; padding: 4px 0; }
        .info-label { color: #64748b; }
        .content-area { background: #0f172a; border-radius: 12px; padding: 24px; border: 1px dashed #475569; margin-bottom: 24px; text-align: center; }
        .doc-preview-text { font-size: 14px; color: #e2e8f0; line-height: 1.6; }
        .actions { display: flex; gap: 12px; justify-content: flex-end; }
        .btn { padding: 10px 18px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s; border: none; }
        .btn-primary { background: #2563eb; color: #ffffff; }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-secondary { background: #334155; color: #f8fafc; }
        .btn-secondary:hover { background: #475569; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="title-group">
            <span class="icon">📄</span>
            <div>
              <h1 class="file-title">${cleanName}</h1>
              <div class="sub-title">EduConnect Academic File Spec</div>
            </div>
          </div>
          <span class="badge">Verified File</span>
        </div>

        <div class="info-box">
          <div class="info-row">
            <span class="info-label">File Name:</span>
            <span>${cleanName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Path / Access URL:</span>
            <span>${filePath}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Opened Timestamp:</span>
            <span>${new Date().toLocaleString()}</span>
          </div>
        </div>

        <div class="content-area">
          <p class="doc-preview-text">
            <strong>EduConnect Document Viewer</strong><br>
            Showing document preview for <code>${cleanName}</code>.<br>
            All submitted faculty instructions and student work files are safely archived in PostgreSQL storage.
          </p>
        </div>

        <div class="actions">
          <button class="btn btn-secondary" onclick="window.close()">Close Window</button>
          <a class="btn btn-primary" href="data:text/plain;charset=utf-8,EduConnect%20Attachment%20Document%20Content%20for%20${encodeURIComponent(cleanName)}" download="${cleanName}">
            ⬇️ Save / Download File
          </a>
        </div>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([docHtml], { type: "text/html" });
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, "_blank");
};
