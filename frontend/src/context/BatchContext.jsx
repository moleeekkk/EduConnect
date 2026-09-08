import React, { createContext, useContext, useState, useEffect } from "react";
import { adminApi } from "../services/api";

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
    try {
      setLoading(true);
      const res = await adminApi.getBatches();
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
        }
      }
    } catch (err) {
      console.error("Error loading batches from database:", err);
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
    return {
      batches: [],
      selectedBatch: null,
      setSelectedBatch: () => {},
      loading: false,
      refreshBatches: () => {},
      setBatches: () => {},
    };
  }
  return context;
};

export default BatchContext;
