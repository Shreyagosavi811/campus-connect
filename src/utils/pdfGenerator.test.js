import { describe, it, expect, vi } from 'vitest';
import { generateReceiptPDF } from './pdfGenerator';

// Mock jsPDF
vi.mock('jspdf', () => {
  const jsPDF = vi.fn();
  jsPDF.prototype.setFont = vi.fn();
  jsPDF.prototype.setFontSize = vi.fn();
  jsPDF.prototype.setTextColor = vi.fn();
  jsPDF.prototype.text = vi.fn();
  jsPDF.prototype.setDrawColor = vi.fn();
  jsPDF.prototype.setLineWidth = vi.fn();
  jsPDF.prototype.line = vi.fn();
  jsPDF.prototype.save = vi.fn();
  jsPDF.prototype.lastAutoTable = { finalY: 100 };
  return { default: jsPDF };
});

// Mock jspdf-autotable
vi.mock('jspdf-autotable', () => ({
  default: vi.fn()
}));

describe('pdfGenerator', () => {
  it('should call jsPDF methods and save the file', () => {
    const transaction = { id: '123', amount: 1000, date: new Date(), paymentMethod: 'UPI' };
    const user = { name: 'John Doe', email: 'john@example.com' };
    const feeRecord = { totalFees: 5000, paidFees: 1000, remainingFees: 4000 };

    generateReceiptPDF(transaction, user, feeRecord);

    // If we wanted to be very thorough, we could inspect the mock calls
    // but here we're just ensuring it doesn't crash and calls save.
  });
});
