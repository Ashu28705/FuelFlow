/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileSpreadsheet, Search, Filter, Download, Eye, FileText, 
  Trash2, SlidersHorizontal, Calendar, X, RefreshCw, DollarSign, CloudLightning 
} from 'lucide-react';

interface ReportsViewProps {
  user: any;
  reports: any[];
  stations: any[];
  onRefresh: () => void;
  toast: (msg: string, type: 'success' | 'danger') => void;
  token: string;
}

export function ReportsView({ user, reports, stations, onRefresh, toast, token }: ReportsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStationFilter, setSelectedStationFilter] = useState('');
  const [selectedReportDetail, setSelectedReportDetail] = useState<any>(null);

  const isOwner = user.role === 'owner' || user.role === 'admin';

  // Apply filters on the reports list on-the-fly
  const filteredReports = reports.filter(r => {
    const sMatches = selectedStationFilter ? r.stationId === selectedStationFilter : true;
    const notesQuery = searchQuery.toLowerCase();
    const queryMatches = !searchQuery || 
      (r.notes || '').toLowerCase().includes(notesQuery) || 
      (r.stationName || '').toLowerCase().includes(notesQuery) ||
      (r.workerName || '').toLowerCase().includes(notesQuery);
    return sMatches && queryMatches;
  });

  const handleDeleteReport = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this sales ledger record permanently?')) return;

    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Deletion request rejected');
      toast('Report deleted successfully', 'success');
      onRefresh();
    } catch (err: any) {
      toast(err.message, 'danger');
    }
  };

  const handleExportData = (format: 'pdf' | 'excel') => {
    toast(`Formulating customized ${format.toUpperCase()} export file from active ledger...`, 'success');
    
    setTimeout(() => {
      // Simulate download sequence
      const dummyContent = "FuelFlow Consolidated Ledger Export Data\n" + JSON.stringify(filteredReports, null, 2);
      const blob = new Blob([dummyContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fuelflow_ledger_${Date.now()}.${format === 'pdf' ? 'pdf' : 'csv'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast(`${format.toUpperCase()} dispatch complete! File downloaded.`, 'success');
    }, 1200);
  };

  return (
    <div className="flex-grow p-8 bg-slate-900 text-slate-100 font-sans overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> Sales Ledger Ledger
          </h2>
          <p className="text-slate-400 text-xs text-left">Detailed repository logs for shift petrol sales, computed gross revenue yields, and uploaded receipts logistics.</p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            id="export-btn-pdf"
            onClick={() => handleExportData('pdf')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-705 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
          <button
            id="export-btn-excel"
            onClick={() => handleExportData('excel')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-705 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" /> Export Excel
          </button>
          <button
            id="ledger-btn-refresh"
            onClick={onRefresh}
            className="p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 rounded-lg transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter and Search bars */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            id="ledger-search-box"
            type="text"
            placeholder="Search keywords, workers or station names..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Station Filter */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-1.5 self-start md:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            id="ledger-station-filter"
            value={selectedStationFilter}
            onChange={e => setSelectedStationFilter(e.target.value)}
            className="bg-transparent border-none outline-none text-[11px] font-bold text-slate-300 focus:ring-0 cursor-pointer"
          >
            <option value="">All Stations Logs</option>
            {stations.map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table Ledger */}
      <div className="bg-slate-950 border border-slate-800/60 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-400">
            <thead className="bg-slate-900/60 border-b border-slate-800/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Submission Date</th>
                <th className="p-4">Station Name</th>
                <th className="p-4">Shift Field Agent</th>
                <th className="p-4 text-right">Petrol Sales</th>
                <th className="p-4 text-right">Diesel Sales</th>
                <th className="p-4 text-right">Expenses</th>
                <th className="p-4 text-right">Computed Gross</th>
                <th className="p-4 text-center">Receipt Bill</th>
                {isOwner && <th className="p-4 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 border-none">
              {filteredReports.length > 0 ? (
                filteredReports.map(rep => {
                  const dateObj = new Date(rep.createdAt);
                  const formattedDate = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <tr 
                      id={`report-row-${rep.id}`}
                      key={rep.id}
                      onClick={() => setSelectedReportDetail(rep)}
                      className="hover:bg-slate-900/40 cursor-pointer transition select-none"
                    >
                      <td className="p-4 font-semibold text-slate-300">{formattedDate}</td>
                      <td className="p-4 font-bold text-white max-w-[150px] truncate">{rep.stationName}</td>
                      <td className="p-4 text-slate-300">{rep.workerName}</td>
                      <td className="p-3 text-right">
                        <span className="font-mono">{rep.petrolSalesLitres}L</span>
                        <span className="text-slate-500 block text-[10px]">${rep.petrolSalesValue}</span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="font-mono">{rep.dieselSalesLitres}L</span>
                        <span className="text-slate-500 block text-[10px]">${rep.dieselSalesValue}</span>
                      </td>
                      <td className="p-4 text-right text-rose-400 font-bold">-${rep.expenses}</td>
                      <td className="p-4 text-right text-emerald-400 font-extrabold">${rep.grossIncome}</td>
                      <td className="p-4 text-center">
                        <button
                          id={`bill-view-${rep.id}`}
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setSelectedReportDetail(rep); 
                          }}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded font-semibold text-[10px] flex items-center gap-1 mx-auto transition"
                        >
                          <Eye className="w-3 h-3" /> View Bill
                        </button>
                      </td>
                      {isOwner && (
                        <td className="p-4 text-center">
                          <button
                            id={`report-delete-${rep.id}`}
                            onClick={(e) => handleDeleteReport(rep.id, e)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 rounded transition mx-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isOwner ? 9 : 8} className="p-8 text-center text-slate-500">No shift sales logs corresponding your filter criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* modal - Detailed report preview & receipt scanner viewer */}
      {selectedReportDetail && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 relative flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-y-auto">
            <button id="report-detail-close" onClick={() => setSelectedReportDetail(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            {/* left column: details list */}
            <div className="flex-1 space-y-4">
              <div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold rounded-full inline-block uppercase mb-1">
                  Validated Sales Invoice
                </span>
                <h3 className="text-base font-bold text-white leading-tight">Shift Operations Review</h3>
                <p className="text-[10px] text-slate-500">Reference CODE: {selectedReportDetail.id}</p>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pumps Node:</span>
                  <span className="text-slate-200 font-bold">{selectedReportDetail.stationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Field Operator:</span>
                  <span className="text-slate-200 font-bold">{selectedReportDetail.workerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fuel Sold:</span>
                  <span className="text-slate-200 font-medium">
                    {selectedReportDetail.petrolSalesLitres}L Petrol / {selectedReportDetail.dieselSalesLitres}L Diesel
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Cash Collections:</span>
                  <span className="text-slate-300 font-semibold">${selectedReportDetail.cashCollection}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Online Transfers:</span>
                  <span className="text-slate-300 font-semibold">${selectedReportDetail.onlinePayments}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2 text-rose-400">
                  <span className="text-slate-500">Expenses Logged:</span>
                  <span className="font-bold">-${selectedReportDetail.expenses}</span>
                </div>
                <div className="flex justify-between text-base border-t border-dashed border-slate-800 pt-2 text-emerald-400">
                  <span className="text-slate-400 font-bold uppercase text-xs">Gross Income:</span>
                  <span className="font-extrabold text-lg">${selectedReportDetail.grossIncome}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Operator shift footnotes:</span>
                <p className="text-[11px] text-slate-300 leading-relaxed italic">"{selectedReportDetail.notes || 'No shift footnotes registered.'}"</p>
              </div>
            </div>

            {/* right column: scanned bill receipt */}
            <div className="w-full md:w-1/2 flex flex-col justify-between shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Attached Receipt Scan log</h4>
                <div className="relative aspect-[3/4] bg-slate-950/80 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center group">
                  <img
                    src={selectedReportDetail.billImage || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=350'}
                    alt="Invoice Receipt Scan"
                    className="w-full h-full object-cover grayscale brightness-90 hover:grayscale-0 transition duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 pointer-events-none"></div>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={selectedReportDetail.billImage}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-center py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg transition"
                >
                  View Original Image
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
