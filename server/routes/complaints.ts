import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { AIEngine } from '../aiEngine';
import { Complaint, ComplaintStatus, PriorityLevel, DepartmentType } from '../../src/types';

const router = Router();

// GET all complaints with optional filtering
router.get('/', (req: Request, res: Response) => {
  try {
    const { department, priority, status, ward, search } = req.query;
    const list = storage.getAllComplaints({
      department: department as string,
      priority: priority as string,
      status: status as string,
      ward: ward as string,
      search: search as string
    });
    res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET complaint by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const complaint = storage.getComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    res.json({ success: true, data: complaint });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create new complaint with full AI pipeline
router.post('/', (req: Request, res: Response) => {
  try {
    const { title, description, location, citizen, images, userDepartmentOverride } = req.body;

    if (!title || !description || !location?.address) {
      return res.status(400).json({ success: false, message: 'Missing required complaint fields' });
    }

    // Run AI Classification Pipeline
    const aiResult = AIEngine.classifyComplaint({
      title,
      description,
      imageUrls: images?.before || [],
      location: { lat: location.lat, lng: location.lng, address: location.address }
    });

    const finalDepartment = (userDepartmentOverride || aiResult.department) as DepartmentType;
    const finalPriority = aiResult.priority as PriorityLevel;
    const finalSlaHours = aiResult.estimatedSlaHours;

    // Generate unique Ticket ID: CIVIC-2026-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const id = `CIVIC-2026-${randomSuffix}`;

    const now = new Date();
    const slaDeadline = new Date(now.getTime() + finalSlaHours * 60 * 60 * 1000).toISOString();

    const newComplaint: Complaint = {
      id,
      title,
      description,
      department: finalDepartment,
      subCategory: aiResult.subCategory,
      priority: finalPriority,
      status: 'AI_Triaged',
      location: {
        address: location.address,
        landmark: location.landmark || 'Not specified',
        ward: location.ward || 'Ward 12 - Central Zone',
        zone: location.zone || 'Central Zone',
        lat: location.lat || 19.0760,
        lng: location.lng || 72.8777
      },
      citizen: {
        name: citizen?.name || 'Concerned Citizen',
        phone: citizen?.phone || '+91 98000 00000',
        email: citizen?.email || 'citizen@civicpulse.org',
        isAnonymous: citizen?.isAnonymous || false
      },
      images: {
        before: images?.before && images.before.length > 0 ? images.before : [
          "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80"
        ],
        after: images?.after || []
      },
      aiAnalysis: aiResult.aiAnalysis,
      timeline: [
        {
          id: `tl-${Date.now()}-1`,
          status: 'Submitted',
          title: 'Grievance Submitted',
          description: 'Grievance registered through CivicPulse AI Web Portal with geo-tagging.',
          timestamp: now.toISOString(),
          actor: citizen?.isAnonymous ? 'Anonymous Citizen' : (citizen?.name || 'Citizen'),
          role: 'Citizen'
        },
        {
          id: `tl-${Date.now()}-2`,
          status: 'AI_Triaged',
          title: 'Automated AI Routing & Triage',
          description: `Auto-assigned to ${finalDepartment}. Priority set to ${finalPriority} (SLA: ${finalSlaHours}h).`,
          timestamp: new Date(now.getTime() + 2000).toISOString(),
          actor: 'CivicPulse AI Engine',
          role: 'Automated System'
        }
      ],
      estimatedSlaHours: finalSlaHours,
      slaDeadline,
      isSlaBreached: false,
      upvotes: 1,
      upvoters: ['creator'],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    const saved = storage.addComplaint(newComplaint);
    res.status(201).json({ success: true, data: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST upvote / Me-Too on a complaint
router.post('/:id/vote', (req: Request, res: Response) => {
  try {
    const voterId = req.body.voterId || req.ip || 'anon-voter';
    const result = storage.upvoteComplaint(req.params.id, voterId);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    res.json({ success: true, data: result.complaint, isFirstVote: result.isFirstVote });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST citizen satisfaction feedback
router.post('/:id/feedback', (req: Request, res: Response) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Valid rating between 1 and 5 required' });
    }
    const updated = storage.submitFeedback(req.params.id, rating, comment || '');
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update status & assignment by official
router.put('/:id/status', (req: Request, res: Response) => {
  try {
    const {
      status,
      assignedOfficerName,
      assignedOfficerRole,
      assignedOfficerPhone,
      resolutionNotes,
      afterImages,
      actorName,
      actorRole
    } = req.body;

    const existing = storage.getComplaintById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const updates: Partial<Complaint> = {};
    const newTimelineEvents = [...existing.timeline];
    const now = new Date().toISOString();

    if (status) {
      const isStatusChange = status !== existing.status;
      updates.status = status as ComplaintStatus;

      if (status === 'Resolved') {
        updates.resolvedAt = now;
        updates.resolutionNotes = resolutionNotes || existing.resolutionNotes || 'Issue verified and resolved by field department.';
        if (afterImages && afterImages.length > 0) {
          updates.images = {
            before: existing.images.before,
            after: afterImages
          };
        }
      } else if (resolutionNotes) {
        updates.resolutionNotes = resolutionNotes;
      }

      let timelineTitle = `Status updated to ${status.replace('_', ' ')}`;
      let timelineDesc = resolutionNotes || `Grievance status transitioned to ${status.replace('_', ' ')}.`;

      if (status === 'Assigned') {
        timelineTitle = `Assigned to ${assignedOfficerName || 'Ward Officer'}`;
        timelineDesc = `Work order issued to ${assignedOfficerRole || 'Field Engineer'}.`;
      } else if (status === 'In_Progress') {
        timelineTitle = 'Field Work in Progress';
        timelineDesc = resolutionNotes || 'Field team deployed on-site for remediation.';
      } else if (status === 'Resolved') {
        timelineTitle = 'Resolution Completed & Verified';
        timelineDesc = resolutionNotes || 'All repair work completed. Photographic proof attached.';
      }

      if (isStatusChange || resolutionNotes) {
        newTimelineEvents.push({
          id: `tl-${Date.now()}`,
          status: status as ComplaintStatus,
          title: timelineTitle,
          description: timelineDesc,
          timestamp: now,
          actor: actorName || 'Municipal Authority',
          role: actorRole || 'Official',
          images: afterImages
        });
      }
    }

    if (assignedOfficerName) {
      updates.assignedTo = {
        officerName: assignedOfficerName,
        officerRole: assignedOfficerRole || 'Field Engineer',
        department: existing.department,
        phone: assignedOfficerPhone || '+91 98000 12345',
        assignedAt: now,
        badgeNumber: existing.assignedTo?.badgeNumber || `OFF-${Math.floor(100 + Math.random() * 900)}`
      };
    }

    updates.timeline = newTimelineEvents;

    const saved = storage.updateComplaint(req.params.id, updates);
    res.json({ success: true, data: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST reopen a resolved complaint with reason
router.post('/:id/reopen', (req: Request, res: Response) => {
  try {
    const { reason, citizenName } = req.body;
    const existing = storage.getComplaintById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const now = new Date().toISOString();
    const newTimeline = [...existing.timeline, {
      id: `tl-${Date.now()}`,
      status: 'In_Progress' as ComplaintStatus,
      title: 'Grievance Reopened by Citizen',
      description: reason || 'Citizen reported the issue was not satisfactorily resolved.',
      timestamp: now,
      actor: citizenName || existing.citizen.name || 'Citizen',
      role: 'Citizen'
    }];

    const updated = storage.updateComplaint(existing.id, {
      status: 'In_Progress',
      priority: existing.priority === 'Low' ? 'Medium' : existing.priority === 'Medium' ? 'High' : 'Critical',
      timeline: newTimeline
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
