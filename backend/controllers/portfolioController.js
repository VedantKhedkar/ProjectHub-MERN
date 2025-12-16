// backend/controllers/portfolioController.js (or wherever your logic is)

const getPortfolioProjects = async (req, res) => {
  try {
    const { search } = req.query; // 1. Get the search term from URL query

    // 2. Build the "Where" clause dynamically
    const whereClause = search
      ? {
          OR: [
            // Search in Project Name (Partial match, Case Insensitive)
            { name: { contains: search, mode: 'insensitive' } },
            // Search in Description
            { description: { contains: search, mode: 'insensitive' } },
            // Search in Tech Stacks (Exact match for array items)
            { techStacks: { has: search } } 
          ],
        }
      : {};

    // 3. Pass the 'where' clause to Prisma
    const projects = await prisma.portfolioProject.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }, 
    });

    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};

module.exports = { getPortfolioProjects };