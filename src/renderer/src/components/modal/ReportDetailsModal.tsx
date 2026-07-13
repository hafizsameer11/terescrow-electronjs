import React, { useState, useEffect } from 'react';
import type { ReportDetail } from '@renderer/data/dailyReportData';

interface ReportDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportDetail | null;
  /** true for admin/auditor: show Approve/Disapprove and Auditors Report editable */
  canApprove?: boolean;
  onApprove?: (reportId: string) => void;
  onDisapprove?: (reportId: string) => void;
}

const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  isOpen,
  onClose,
  report,
  canApprove = false,
  onApprove,
  onDisapprove,
}) => {
  const [myReport, setMyReport] = useState(report?.myReport ?? '');
  const [auditorsReport, setAuditorsReport] = useState(report?.auditorsReport ?? '');

  useEffect(() => {
    if (report) {
      setMyReport(report.myReport ?? '');
      setAuditorsReport(report.auditorsReport ?? '');
    }
  }, [report]);

  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[250] overflow-y-auto p-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-800">Report Details</h2>
            <span
              className={`px-2 py-0.5 rounded text-sm font-medium flex items-center gap-1 ${
                report.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${report.status === 'approved' ? 'bg-green-600' : 'bg-red-500'}`} />
              {report.status === 'approved' ? 'Approved' : 'Not Approved'}
            </span>
            <button className="p-1 text-gray-500 hover:text-gray-800" title="Upload">↑</button>
            <button className="p-1 text-gray-500 hover:text-gray-800" title="Print">🖨</button>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl" aria-label="Close">
            &times;
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <p><span className="text-gray-500">Date:</span> {report.date}</p>
            <p><span className="text-gray-500">Agent Name:</span> {report.agentName}</p>
            <p><span className="text-gray-500">Position:</span> {report.position}</p>
            <p><span className="text-gray-500">Shift:</span> {report.shift}</p>
            <p><span className="text-gray-500">Auditor Name:</span> {report.auditorName}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Login & Activity Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <p><span className="text-gray-500">Clock In Time:</span> {report.clockInTime}</p>
              <p><span className="text-gray-500">Clock Out Time:</span> {report.clockOutTime}</p>
              <p><span className="text-gray-500">Active Hours:</span> {report.activeHours}</p>
              <p><span className="text-gray-500">Total chat session handled:</span> {report.totalChatSessions}</p>
              <p><span className="text-gray-500">Average response time:</span> {report.avgResponseTimeSec} sec</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-3">
              <h4 className="font-medium text-gray-800 mb-2">Gift Card Summary</h4>
              <p className="text-sm">GC purchase amt: {report.giftCard.purchaseAmt}</p>
              <p className="text-sm">GC Sales amt: {report.giftCard.salesAmt}</p>
              <p className="text-sm font-medium">Profit: {report.giftCard.profit}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <h4 className="font-medium text-gray-800 mb-2">Crypto Summary</h4>
              <p className="text-sm">Crypto Opening balance: {report.crypto.openingBalance}</p>
              <p className="text-sm">Crypto Closing balance: {report.crypto.closingBalance}</p>
              <p className="text-sm font-medium">Profit: {report.crypto.profit}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <h4 className="font-medium text-gray-800 mb-2">Bill Payments Summary</h4>
              <p className="text-sm">BP Opening balance: {report.billPayments.openingBalance}</p>
              <p className="text-sm">BP Closing Balance: {report.billPayments.closingBalance}</p>
              <p className="text-sm font-medium">Profit: {report.billPayments.profit}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-3">
              <h4 className="font-medium text-gray-800 mb-2">Chat</h4>
              <p className="text-sm">Successful Chats: <a href="#" className="text-[#147341] hover:underline">View Profit for each chat</a> <a href="#" className="text-[#147341] hover:underline">View {report.chat.successful}</a></p>
              <p className="text-sm">Pending Chats: <a href="#" className="text-[#147341] hover:underline">View {report.chat.pending}</a></p>
              <p className="text-sm">Unsuccessful Chats: <a href="#" className="text-[#147341] hover:underline">View {report.chat.unsuccessful}</a></p>
              <p className="text-sm font-medium mt-1">Total Profit from chat: {report.chat.totalProfit}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <h4 className="font-medium text-gray-800 mb-2">Financials</h4>
              <p className="text-sm text-red-600">Earn Payout: {report.financials.earnPayout}</p>
              <p className="text-sm">Opening balance: {report.financials.openingBalance}</p>
              <p className="text-sm">Closing balance: {report.financials.closingBalance}</p>
              <p className="text-sm font-medium">Total Profit for the shift: {report.financials.totalProfit}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">My Report</label>
              <textarea
                value={myReport}
                onChange={(e) => setMyReport(e.target.value)}
                readOnly={canApprove}
                rows={3}
                placeholder="Type here to add a report"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#147341] read-only:bg-gray-50"
              />
            </div>
            {canApprove && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auditors Report</label>
                <textarea
                  value={auditorsReport}
                  onChange={(e) => setAuditorsReport(e.target.value)}
                  rows={3}
                  placeholder="Type here to add a report"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#147341]"
                />
              </div>
            )}
          </div>

          {canApprove && (
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => onApprove?.(report.id)}
                className="flex-1 py-2.5 bg-[#147341] text-white font-medium rounded-lg hover:bg-[#0d5a2e]"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => onDisapprove?.(report.id)}
                className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700"
              >
                Disapprove
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetailsModal;
