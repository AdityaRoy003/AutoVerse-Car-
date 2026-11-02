import { Readable } from 'stream';
import csvParser from 'csv-parser';
import mongoose from 'mongoose';
import { Lead } from '../models/Lead.js';
import { Showroom } from '../models/Showroom.js';
import { CarModel } from '../models/CarModel.js';
import { LeadAssignmentEngine } from './leadAssignmentEngine.js';
import { CSVImport } from '../models/CSVImport.js';

export interface CSVLeadRow {
  Name: string;
  Phone: string;
  Email: string;
  Model?: string;
  Budget?: string;
  Showroom?: string;
  Message?: string;
}

export interface CSVValidationResult {
  totalRows: number;
  validRows: Array<{
    rowNumber: number;
    data: CSVLeadRow;
  }>;
  invalidRows: Array<{
    rowNumber: number;
    data: any;
    error: string;
  }>;
  duplicateRows: Array<{
    rowNumber: number;
    phone: string;
    reason: string;
  }>;
}

export class CSVParserService {
  /**
   * Parse and validate CSV buffer without committing to DB (Preview Mode)
   */
  static async validateAndPreview(csvBuffer: Buffer): Promise<CSVValidationResult> {
    const rawRows: any[] = [];
    const stream = Readable.from(csvBuffer);

    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', (row) => rawRows.push(row))
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    const validRows: any[] = [];
    const invalidRows: any[] = [];
    const duplicateRows: any[] = [];
    const seenPhonesInBatch = new Set<string>();

    for (let index = 0; index < rawRows.length; index++) {
      const row = rawRows[index];
      const rowNumber = index + 1;

      // Extract and normalize keys (case-insensitive)
      const name = (row.Name || row.name || row['Customer Name'] || '').trim();
      const rawPhone = (row.Phone || row.phone || row['Mobile'] || row['Phone Number'] || '').replace(/\D/g, '');
      const email = (row.Email || row.email || row['Email Address'] || '').trim();
      const model = (row.Model || row.model || row['Interested Model'] || '').trim();
      const budget = (row.Budget || row.budget || '').trim();
      const showroom = (row.Showroom || row.showroom || '').trim();
      const message = (row.Message || row.message || row['Notes'] || '').trim();

      // Check required fields
      if (!name) {
        invalidRows.push({ rowNumber, data: row, error: 'Customer Name is required.' });
        continue;
      }

      // Validate 10-digit phone
      const phoneDigits = rawPhone.length > 10 && rawPhone.startsWith('91') ? rawPhone.slice(2) : rawPhone;
      if (phoneDigits.length !== 10) {
        invalidRows.push({ rowNumber, data: row, error: `Invalid phone number format: "${rawPhone}". Expected 10 digits.` });
        continue;
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        invalidRows.push({ rowNumber, data: row, error: `Invalid email address format: "${email}".` });
        continue;
      }

      // Check batch duplicate
      if (seenPhonesInBatch.has(phoneDigits)) {
        duplicateRows.push({ rowNumber, phone: phoneDigits, reason: 'Duplicate phone number found within the same CSV file.' });
        continue;
      }
      seenPhonesInBatch.add(phoneDigits);

      // Check database duplicate (active lead in past 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const existing = await Lead.findOne({
        customerPhone: phoneDigits,
        createdAt: { $gte: thirtyDaysAgo },
      });

      if (existing) {
        duplicateRows.push({
          rowNumber,
          phone: phoneDigits,
          reason: `Lead already exists in CRM (Status: ${existing.status}, Created: ${existing.createdAt.toISOString().slice(0, 10)})`,
        });
        continue;
      }

      validRows.push({
        rowNumber,
        data: {
          Name: name,
          Phone: phoneDigits,
          Email: email,
          Model: model,
          Budget: budget,
          Showroom: showroom,
          Message: message,
        },
      });
    }

    return {
      totalRows: rawRows.length,
      validRows,
      invalidRows,
      duplicateRows,
    };
  }

  /**
   * Process and import valid rows, auto-assign leads, and record audit log
   */
  static async executeImport(
    csvBuffer: Buffer,
    fileName: string,
    importedByUserId?: string
  ) {
    const preview = await this.validateAndPreview(csvBuffer);
    const showrooms = await Showroom.find({ active: true });
    const carModels = await CarModel.find({ active: true });

    let successCount = 0;
    const failures: Array<{ row: number; error: string; data?: any }> = [];

    // Copy initial invalid rows
    for (const inv of preview.invalidRows) {
      failures.push({ row: inv.rowNumber, error: inv.error, data: inv.data });
    }
    for (const dup of preview.duplicateRows) {
      failures.push({ row: dup.rowNumber, error: dup.reason });
    }

    // Process valid rows
    for (const item of preview.validRows) {
      try {
        const row = item.data;

        // Resolve showroom
        let matchedShowroom = showrooms.find((s) =>
          row.Showroom && s.name.toLowerCase().includes(row.Showroom.toLowerCase())
        );
        if (!matchedShowroom && showrooms.length > 0) {
          matchedShowroom = showrooms[0]; // Default to Lucknow Central
        }

        // Resolve model
        let matchedModel = carModels.find((m) =>
          row.Model && m.name.toLowerCase().includes(row.Model.toLowerCase())
        );

        // Create Lead
        const deadline = new Date(Date.now() + 5 * 60 * 1000);
        const newLead = new Lead({
          customerName: row.Name,
          customerPhone: row.Phone,
          customerEmail: row.Email,
          interestedModelId: matchedModel?._id,
          budgetRange: row.Budget || '10-15 Lakh',
          preferredShowroom: matchedShowroom?._id,
          leadSource: 'Portal CSV import',
          status: 'NEW',
          responseDeadline: deadline,
          message: row.Message || `Imported via portal CSV (${fileName}). Interested in ${row.Model || 'passenger vehicle'}.`,
          consentGiven: true,
          consentTimestamp: new Date(),
          policyVersion: '1.0',
        });

        await newLead.save();

        // Auto assign using LeadAssignmentEngine
        await LeadAssignmentEngine.assignLead(
          newLead._id,
          matchedShowroom?._id,
          matchedModel?._id,
          importedByUserId || 'SYSTEM_AUTO',
          `Imported from CSV (${fileName}) and automatically assigned.`
        );

        successCount++;
      } catch (err: any) {
        failures.push({
          row: item.rowNumber,
          error: err.message || 'Error creating lead in database',
        });
      }
    }

    // Save CSVImport record
    const importDoc = await CSVImport.create({
      fileName,
      importedBy: importedByUserId ? new mongoose.Types.ObjectId(importedByUserId) : undefined,
      totalRows: preview.totalRows,
      successCount,
      failureCount: failures.length,
      errorDetails: failures,
      importedAt: new Date(),
    });

    return {
      importId: importDoc._id,
      fileName,
      totalRows: preview.totalRows,
      successCount,
      failureCount: failures.length,
      failures,
    };
  }
}

