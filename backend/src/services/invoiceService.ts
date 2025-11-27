import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { IPayment } from '../models/Payment';
import { IUser } from '../models/User';
import { ICourseDocument } from '../models/Course';

export const generateInvoicePDF = async (
  payment: IPayment,
  user: IUser, 
  course: ICourseDocument
): Promise<string> => {
  try {
    console.log('📄 Generating invoice PDF for payment:', payment._id);
    
    // 1. Generate HTML template
    const htmlContent = generateInvoiceHTML(payment, user, course);
    
    // 2. Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    
    // 3. Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm', 
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    await browser.close();
    
    // 4. Save to local storage
    const invoiceDir = 'uploads/payment-invoices';
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
      console.log('📁 Created invoice directory:', invoiceDir);
    }
    
    const fileName = `invoice-${payment._id}.pdf`;
    const filePath = path.join(invoiceDir, fileName);
    
    fs.writeFileSync(filePath, pdfBuffer);
    console.log('✅ Invoice PDF saved:', filePath);
    
    // 5. Return relative path (same format as existing receipts)
    return filePath;
    
  } catch (error) {
    console.error('❌ Error generating invoice PDF:', error);
    throw new Error('Failed to generate invoice PDF');
  }
};

const generateInvoiceHTML = (payment: IPayment, user: IUser, course: ICourseDocument): string => {
  const invoiceNumber = `INV-${String(payment._id).slice(-8).toUpperCase()}`;
  const paymentDate = new Date(payment.paymentDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${invoiceNumber}</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          margin: 0; 
          padding: 20px; 
          background-color: #f8f9fa;
          color: #333;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header { 
          text-align: center; 
          margin-bottom: 40px; 
          border-bottom: 3px solid #007bff;
          padding-bottom: 20px;
        }
        .invoice-title { 
          font-size: 32px; 
          font-weight: bold; 
          color: #007bff; 
          margin-bottom: 10px;
        }
        .invoice-number { 
          font-size: 18px; 
          color: #666; 
          margin-top: 10px; 
        }
        .content { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 40px; 
        }
        .bill-to, .payment-info { 
          width: 45%; 
        }
        .section-title { 
          font-weight: bold; 
          margin-bottom: 15px; 
          color: #333;
          font-size: 16px;
          border-bottom: 2px solid #e9ecef;
          padding-bottom: 5px;
        }
        .info-item {
          margin-bottom: 8px;
          color: #555;
        }
        .item-row { 
          display: flex; 
          justify-content: space-between; 
          padding: 15px 0; 
          border-bottom: 1px solid #e9ecef; 
          font-size: 16px;
        }
        .item-label {
          font-weight: 500;
        }
        .total-row { 
          font-weight: bold; 
          font-size: 20px; 
          padding: 20px 0; 
          border-top: 3px solid #007bff; 
          margin-top: 20px;
          background-color: #f8f9fa;
          padding-left: 20px;
          padding-right: 20px;
          border-radius: 5px;
        }
        .footer { 
          text-align: center; 
          margin-top: 50px; 
          color: #666; 
          font-size: 14px;
          border-top: 1px solid #e9ecef;
          padding-top: 20px;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-verified {
          background-color: #d4edda;
          color: #155724;
        }
        .status-pending {
          background-color: #fff3cd;
          color: #856404;
        }
        .status-rejected {
          background-color: #f8d7da;
          color: #721c24;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="invoice-title">MEDHOME</div>
          <div style="font-size: 18px; color: #666; margin-bottom: 10px;">Medical Education Platform</div>
          <div class="invoice-number">Invoice #: ${invoiceNumber}</div>
          <div style="margin-top: 10px; font-size: 16px;">Date: ${paymentDate}</div>
        </div>
        
        <div class="content">
          <div class="bill-to">
            <div class="section-title">Bill To:</div>
            <div class="info-item"><strong>${user.fullName}</strong></div>
            <div class="info-item">${user.email}</div>
            <div class="info-item">${user.whatsappNumber}</div>
          </div>
          
          <div class="payment-info">
            <div class="section-title">Payment Information:</div>
            <div class="info-item"><strong>Method:</strong> ${payment.paymentMethod.toUpperCase()}</div>
            <div class="info-item"><strong>Transaction ID:</strong> ${payment.transactionId || 'N/A'}</div>
            <div class="info-item"><strong>Status:</strong> 
              <span class="status-badge status-${payment.status}">${payment.status.toUpperCase()}</span>
            </div>
          </div>
        </div>
        
        <div class="item-row">
          <div class="item-label">Course: ${course.title}</div>
          <div><strong>$${course.price.toFixed(2)}</strong></div>
        </div>
        
        <div class="total-row">
          <div>Total Amount:</div>
          <div>$${course.price.toFixed(2)}</div>
        </div>
        
        <div class="footer">
          <div style="margin-bottom: 10px;"><strong>Thank you for your enrollment!</strong></div>
          <div>For support, contact us at support@medhome.com</div>
          <div style="margin-top: 10px; font-size: 12px; color: #999;">
            This is an automated invoice generated by MedHome Medical Education Platform
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
