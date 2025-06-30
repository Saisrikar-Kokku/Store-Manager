'use client';
import React, { useRef, useState } from 'react';
import Papa, { ParseResult } from 'papaparse';
import { useBusiness } from '@/context/TransactionContext';
import { supabase } from '@/utils/supabaseClient';

export default function BatchImportExportPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<string | null>(null);
  const { userId, refetchAllData } = useBusiness();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: ParseResult<Record<string, string>>) => {
        const rows = results.data.map((row: Record<string, string>) => ({
          user_id: userId,
          name: row.name || row.Name || '',
          category: row.category || row.Category || '',
          cost_price: Number(row.cost_price || row.CostPrice || 0),
          quantity: Number(row.quantity || row.Quantity || 0),
          vendor: row.vendor || row.Vendor || '',
          date_added: row.date_added || row.DateAdded || null,
          notes: row.notes || row.Notes || '',
          photo_url: row.photo_url || row.PhotoUrl || null,
        }));
        // Bulk insert
        const { error } = await supabase.from('inventory').insert(rows);
        setImporting(false);
        if (error) {
          setImportResult('Import failed: ' + error.message);
        } else {
          setImportResult(`Imported ${rows.length} items successfully.`);
          await refetchAllData();
        }
      },
      error: (err: Error) => {
        setImporting(false);
        setImportResult('Failed to parse CSV: ' + err.message);
      },
    });
  };

  const handleDeleteAll = async () => {
    if (!userId) return;
    setDeleting(true);
    setDeleteResult(null);
    const { error } = await supabase.from('inventory').delete().eq('user_id', userId);
    setDeleting(false);
    setShowConfirm(false);
    if (error) {
      setDeleteResult('Failed to delete items: ' + error.message);
    } else {
      setDeleteResult('All inventory items deleted successfully.');
    }
  };

  const handleExport = async () => {
    if (!userId) return;
    setExporting(true);
    setExportResult(null);
    const { data, error } = await supabase.from('inventory').select('*').eq('user_id', userId);
    setExporting(false);
    if (error) {
      setExportResult('Export failed: ' + error.message);
      return;
    }
    if (!data || data.length === 0) {
      setExportResult('No inventory items to export.');
      return;
    }
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportResult(`Exported ${data.length} items successfully.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-luvora">Batch Import / Export</h1>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Export Data</h2>
          <button
            className="bg-luvora text-white px-4 py-2 rounded-lg"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export Inventory as CSV'}
          </button>
          {exportResult && (
            <div className="mt-4 text-pink-300">{exportResult}</div>
          )}
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Import Data</h2>
          <input
            type="file"
            accept=".csv"
            className="mb-4"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={importing}
          />
          <button
            className="bg-luvora text-white px-4 py-2 rounded-lg"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            disabled={importing}
          >
            {importing ? 'Importing...' : 'Import Inventory from CSV'}
          </button>
          {importResult && (
            <div className="mt-4 text-pink-300">{importResult}</div>
          )}
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Danger Zone</h2>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            onClick={() => setShowConfirm(true)}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete ALL Inventory Items'}
          </button>
          {deleteResult && (
            <div className="mt-4 text-pink-300">{deleteResult}</div>
          )}
          {showConfirm && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
              <div className="bg-gray-900 border border-red-600 rounded-lg p-8 max-w-sm w-full text-center">
                <h3 className="text-lg font-bold text-red-500 mb-4">Are you sure?</h3>
                <p className="mb-6">This will permanently delete <b>all</b> your inventory items. This action cannot be undone.</p>
                <div className="flex justify-center gap-4">
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    onClick={handleDeleteAll}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Yes, Delete All'}
                  </button>
                  <button
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                    onClick={() => setShowConfirm(false)}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 