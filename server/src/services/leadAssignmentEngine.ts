import mongoose from 'mongoose';
import { User, IUser } from '../models/User.js';
import { Lead, ILead } from '../models/Lead.js';
import { LeadAssignmentHistory } from '../models/LeadAssignmentHistory.js';

export interface AssignmentResult {
  assignedConsultantId?: mongoose.Types.ObjectId;
  assignedConsultantName?: string;
  reason: string;
}

export class LeadAssignmentEngine {
  /**
   * Assigns a newly created or unassigned lead atomically using workload-balancing & showroom/model matching.
   */
  static async assignLead(
    leadId: mongoose.Types.ObjectId | string,
    preferredShowroomId?: mongoose.Types.ObjectId | string,
    interestedModelId?: mongoose.Types.ObjectId | string,
    assignedBy: string | mongoose.Types.ObjectId = 'SYSTEM_AUTO',
    overrideReason?: string
  ): Promise<AssignmentResult> {
    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw new Error(`Lead ${leadId} not found for assignment.`);
    }

    // 1. Find eligible active sales consultants
    const baseQuery: any = {
      role: 'SALES_CONSULTANT',
      active: true,
    };

    // Filter by preferred showroom if specified
    if (preferredShowroomId) {
      baseQuery.assignedShowroom = preferredShowroomId;
    }

    let candidates = await User.find(baseQuery);

    // If no consultant in that showroom, fall back to any active sales consultant
    if (candidates.length === 0 && preferredShowroomId) {
      candidates = await User.find({ role: 'SALES_CONSULTANT', active: true });
    }

    // If still no consultants, keep lead unassigned
    if (candidates.length === 0) {
      return {
        reason: 'No active sales consultants available in the dealership roster.',
      };
    }

    // 2. Filter by interested vehicle model specialisation if consultants have configured models
    if (interestedModelId) {
      const specialized = candidates.filter((c) =>
        c.supportedModels && c.supportedModels.length > 0 &&
        c.supportedModels.some((m) => m.toString() === interestedModelId.toString())
      );
      if (specialized.length > 0) {
        candidates = specialized;
      }
    }

    // 3. Workload Balance: Count active leads for each candidate
    // Active leads are NEW, ASSIGNED, CONTACTED, FOLLOW_UP
    const candidateIds = candidates.map((c) => c._id);
    const activeLeadCounts = await Lead.aggregate([
      {
        $match: {
          assignedConsultantId: { $in: candidateIds },
          status: { $in: ['NEW', 'ASSIGNED', 'CONTACTED', 'FOLLOW_UP'] },
        },
      },
      {
        $group: {
          _id: '$assignedConsultantId',
          activeCount: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map<string, number>();
    for (const record of activeLeadCounts) {
      countMap.set(record._id.toString(), record.activeCount);
    }

    // 4. Find lowest active lead workload (tie-breaker: round-robin / lowest count)
    let selectedCandidate: IUser = candidates[0];
    let minCount = countMap.get(selectedCandidate._id.toString()) || 0;

    for (let i = 1; i < candidates.length; i++) {
      const current = candidates[i];
      const count = countMap.get(current._id.toString()) || 0;
      if (count < minCount) {
        minCount = count;
        selectedCandidate = current;
      }
    }

    // 5. Atomic lead assignment & deadline setup (5-minute response target)
    const deadline = new Date(Date.now() + 5 * 60 * 1000);
    const previousConsultantId = lead.assignedConsultantId;

    lead.assignedConsultantId = selectedCandidate._id;
    lead.status = 'ASSIGNED';
    lead.responseDeadline = deadline;
    lead.isOverdue = false;
    await lead.save();

    // 6. Record assignment history
    const assignmentReason = overrideReason || (
      `Assigned to ${selectedCandidate.name} (Active workload: ${minCount} leads) based on showroom matching and workload balancing.`
    );

    await LeadAssignmentHistory.create({
      leadId: lead._id,
      assignedTo: selectedCandidate._id,
      assignedBy: assignedBy,
      previousConsultantId,
      reason: assignmentReason,
      assignedAt: new Date(),
    });

    return {
      assignedConsultantId: selectedCandidate._id,
      assignedConsultantName: selectedCandidate.name,
      reason: assignmentReason,
    };
  }

  /**
   * Manual reassignment by sales manager or consultant with reason
   */
  static async reassignLead(
    leadId: string,
    newConsultantId: string,
    reassignedById: string,
    reason: string
  ): Promise<AssignmentResult> {
    const [lead, consultant] = await Promise.all([
      Lead.findById(leadId),
      User.findById(newConsultantId),
    ]);

    if (!lead) throw new Error('Lead not found.');
    if (!consultant || consultant.role !== 'SALES_CONSULTANT' || !consultant.active) {
      throw new Error('Selected consultant is invalid or inactive.');
    }

    const previousConsultantId = lead.assignedConsultantId;
    lead.assignedConsultantId = consultant._id;
    lead.status = 'ASSIGNED';
    // Reset 5 minute timer for new consultant
    lead.responseDeadline = new Date(Date.now() + 5 * 60 * 1000);
    lead.isOverdue = false;
    await lead.save();

    await LeadAssignmentHistory.create({
      leadId: lead._id,
      assignedTo: consultant._id,
      assignedBy: new mongoose.Types.ObjectId(reassignedById),
      previousConsultantId,
      reason: reason || 'Manual reassignment by authorized consultant.',
      assignedAt: new Date(),
    });

    return {
      assignedConsultantId: consultant._id,
      assignedConsultantName: consultant.name,
      reason,
    };
  }
}

