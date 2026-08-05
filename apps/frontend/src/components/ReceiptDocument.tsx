import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';
import Button from '@/components/ui/button';

interface Payment {
  id: number;
  type: string;
  description: string;
  amount: number;
  dueDate: string;
  status: string;
  paymentDate?: string;
  method?: string;
  reference?: string;
  semester: string;
  academicYear: string;
}

interface ReceiptDocumentProps {
  payment: Payment;
  user: {
    firstName: string;
    lastName: string;
    indexNumber: string;
    programOfStudy: string;
  };
}

export const downloadPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Make element visible for canvas capture if it's hidden
  const originalDisplay = element.style.display;
  element.style.display = 'block';

  try {
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  } finally {
    element.style.display = originalDisplay;
  }
};

export default function ReceiptDocument({ payment, user }: ReceiptDocumentProps) {
  const receiptId = `receipt-${payment.id}`;

  return (
    <>
      <Button 
        onClick={() => downloadPDF(receiptId, `UPSA_Receipt_${payment.reference || payment.id}.pdf`)}
        className="w-full text-xs font-black uppercase tracking-widest text-[#003366] bg-[#003366]/10 hover:bg-[#003366]/20 border-none rounded-xl py-4"
      >
        <Download className="w-4 h-4 mr-2" />
        Receipt
      </Button>

      {/* Hidden Receipt Element for PDF Generation */}
      <div style={{ display: 'none' }}>
        <div 
          id={receiptId} 
          className="bg-white text-slate-900 p-12 mx-auto" 
          style={{ width: '800px', minHeight: '1131px', fontFamily: 'sans-serif' }}
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-[#003366] pb-8 mb-8">
            <div>
              <h1 className="text-4xl font-black text-[#003366] tracking-tighter uppercase">UPSA</h1>
              <h2 className="text-lg font-bold text-[#B8860B] uppercase tracking-widest mt-1">Hostel Management System</h2>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Receipt</h1>
              <p className="text-sm font-bold text-slate-500 mt-2">Ref: {payment.reference || `PAY-${payment.id}`}</p>
              <p className="text-sm font-bold text-slate-500">Date: {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Student & Payment Info */}
          <div className="grid grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Received From</h3>
              <p className="text-lg font-bold text-slate-900">{user.firstName} {user.lastName}</p>
              <p className="text-sm font-bold text-slate-600 mt-1">ID: {user.indexNumber}</p>
              <p className="text-sm font-bold text-slate-600 mt-1">Program: {user.programOfStudy}</p>
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Payment Details</h3>
              <p className="text-sm font-bold text-slate-600"><span className="text-slate-400">Semester:</span> {payment.semester}</p>
              <p className="text-sm font-bold text-slate-600 mt-1"><span className="text-slate-400">Academic Year:</span> {payment.academicYear}</p>
              <p className="text-sm font-bold text-slate-600 mt-1"><span className="text-slate-400">Method:</span> {payment.method || 'Online'}</p>
            </div>
          </div>

          {/* Line Items */}
          <table className="w-full mb-12">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left text-xs font-black text-slate-400 uppercase tracking-widest pb-4">Description</th>
                <th className="text-right text-xs font-black text-slate-400 uppercase tracking-widest pb-4">Amount (GHS)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-6 text-sm font-bold text-slate-900">{payment.description}</td>
                <td className="py-6 text-sm font-bold text-slate-900 text-right">{payment.amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-16">
            <div className="w-1/2">
              <div className="flex justify-between items-center py-4 border-t-4 border-[#003366]">
                <span className="text-lg font-black text-[#003366] uppercase tracking-widest">Total Paid</span>
                <span className="text-2xl font-black text-[#003366]">GHS {payment.amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-auto pt-16 border-t border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Thank you for your payment</p>
            <p className="text-[10px] font-bold text-slate-300">University of Professional Studies, Accra • Hostel Management System</p>
            <p className="text-[10px] font-bold text-slate-300 mt-1">This is a computer-generated receipt and requires no physical signature.</p>
          </div>
        </div>
      </div>
    </>
  );
}
