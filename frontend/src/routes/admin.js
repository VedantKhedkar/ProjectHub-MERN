// --- (ADMIN) GET ALL PROJECTS ---
// GET /api/admin/projects
router.get('/projects', verifyToken, async (req, res) => {
  try {
    // Find all projects and include the email of the user who submitted it
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true } // Select only the email from the related User model
        }
      }
    });
    res.status(200).json(projects);
  } catch (error) {
    console.error('Admin Get Projects Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// --- (ADMIN) UPDATE PROJECT STATUS ---
// PATCH /api/admin/projects/status/:projectId
router.patch('/projects/status/:projectId', verifyToken, async (req, res) => {
  const { projectId } = req.params;
  const { status } = req.body;

  try {
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { status: status },
    });

    res.status(200).json({
      message: 'Project status updated successfully.',
      project: updatedProject,
    });
  } catch (error) {
    console.error('Admin Update Project Status Error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Project not found.' });
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
});