import prisma from '../config/prisma.js';

/**
 * Fetch all applications tracked by current user
 * Route: GET /api/applications
 */
export const getApplications = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const applications = await prisma.jobApplication.findMany({
      where: { userId },
      orderBy: { appliedDate: 'desc' }
    });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get Applications Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tracked applications: ' + error.message
    });
  }
};

/**
 * Add a new job application to the tracker
 * Route: POST /api/applications
 */
export const createApplication = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const {
      company,
      role,
      status = 'Applied',
      appliedDate,
      jobDescription = '',
      matchScore = 82,
      link = '',
      notes = '',
      salary = '',
      deadline = ''
    } = req.body;

    if (!company || !role) {
      return res.status(400).json({
        success: false,
        message: 'Company and Role are required fields.'
      });
    }

    // Combine salary/deadline into notes if provided
    let combinedNotes = notes;
    if (salary || deadline) {
      const extra = [];
      if (salary) extra.push(`CTC/Stipend: ${salary}`);
      if (deadline) extra.push(`Deadline: ${deadline}`);
      combinedNotes = combinedNotes ? `${combinedNotes} | ${extra.join(' | ')}` : extra.join(' | ');
    }

    const newApplication = await prisma.jobApplication.create({
      data: {
        userId,
        company,
        role,
        status,
        appliedDate: appliedDate ? new Date(appliedDate) : new Date(),
        jobDescription,
        matchScore: parseFloat(matchScore) || 82,
        link,
        notes: combinedNotes
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Job application added to tracking pipeline.',
      application: newApplication
    });
  } catch (error) {
    console.error('Create Application Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save application: ' + error.message
    });
  }
};

/**
 * Update an existing job application status or details
 * Route: PUT /api/applications/:id
 */
export const updateApplication = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { status, matchScore, company, role, link, notes } = req.body;

    const existing = await prisma.jobApplication.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Application not found or unauthorized.' });
    }

    const updated = await prisma.jobApplication.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(matchScore !== undefined && { matchScore: parseFloat(matchScore) }),
        ...(company && { company }),
        ...(role && { role }),
        ...(link !== undefined && { link }),
        ...(notes !== undefined && { notes })
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Application updated successfully.',
      application: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a job application
 * Route: DELETE /api/applications/:id
 */
export const deleteApplication = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const existing = await prisma.jobApplication.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Application not found or unauthorized.' });
    }

    await prisma.jobApplication.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Application deleted from tracker.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
