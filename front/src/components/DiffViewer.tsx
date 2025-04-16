
import React, { useState, useEffect } from "react";
import { getDiff } from "../utils/diff";

interface DiffViewerProps {
  paperId: string;
  verA: string;
  verB: string;
}

export default function DiffViewer({ paperId, verA, verB }: DiffViewerProps) {
  const [diff, setDiff] = useState<any>(null);

  useEffect(() => {
    const fetchDiff = async () => {
      try {
        const data = await getDiff(paperId, verA, verB);
        setDiff(data);
      } catch (error) {
        console.error("Failed to fetch diff:", error);
        setDiff(null)
      }
    };

    fetchDiff();
  }, [paperId, verA, verB]);

  if (!diff) {
    return <div>Loading or No Diff Data</div>;
  }
  return (
    <div className="border rounded-md p-4 bg-gray-50 overflow-auto">
      <pre className="whitespace-pre-wrap font-mono text-sm">{JSON.stringify(diff)}
      </pre>
    </div>
  );
}
