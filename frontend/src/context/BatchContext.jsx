import React, { createContext, useContext, useState, useEffect } from "react";
import { adminApi, teacherApi, studentApi, getAuthToken, getAuthUser } from "../services/api";

const BatchContext = createContext();

export const BatchProvider = ({ children }) => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatchState] = useState(() => {
    const saved = localStorage.getItem("educonnect_active_batch");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved active batch", e);
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  const fetchBatches = async () => {
    const token = getAuthToken();
    const user = getAuthUser();
    if (!token || !user) {
      setLoading(false);
      return;
    }

    try {
      const rawRole = user?.role ? String(user.role).toUpperCase().replace("ROLE_", "") : "";
      setLoading(true);
      let res = [];
      if (rawRole === "ADMIN") {
        res = await adminApi.getBatches();
      } else if (rawRole === "TEACHER") {
        res = await teacherApi.getBatches();
      } else if (rawRole === "STUDENT") {
        res = await studentApi.getBatches();
      } else {
        setLoading(false);
        return;
      }

      if (Array.isArray(res)) {
        setBatches(res);
        if (res.length > 0) {
          const savedId = selectedBatch?.batch_id || selectedBatch?.batchId;
          const exists = res.find(
            (b) => (b.batch_id || b.batchId) === savedId
          );
          if (!exists) {
            const defaultActive =
              res.find((b) => b.is_active === true || b.isActive === true) ||
              res[0];
            setSelectedBatch(defaultActive);
          }
        } else {
          setSelectedBatch(null);
        }
      }
    } catch (err) {
      console.warn("Batch list notice:", err.message);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const setSelectedBatch = (batch) => {
    setSelectedBatchState(batch);
    if (batch) {
      localStorage.setItem("educonnect_active_batch", JSON.stringify(batch));
    } else {
      localStorage.removeItem("educonnect_active_batch");
    }
  };

  return (
    <BatchContext.Provider
      value={{
        batches,
        selectedBatch,
        setSelectedBatch,
        loading,
        refreshBatches: fetchBatches,
        setBatches,
      }}
    >
      {children}
    </BatchContext.Provider>
  );
};

export const useBatch = () => {
  const context = useContext(BatchContext);
  if (!context) {
    throw new Error("useBatch must be used within a BatchProvider");
  }
  return context;
};

export default BatchContext;
