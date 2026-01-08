import PortfolioProject from '../models/PortfolioProject.js'; // Ensure correct path

const getPortfolioProjects = async (req, res) => {
  try {
    const { search } = req.query; // 1. Get the search term from URL query

    // 2. Build the MongoDB Filter dynamically (Replacing Prisma OR)
    let filter = {};

    if (search) {
      // Create a case-insensitive regex for partial matches
      const searchRegex = new RegExp(search, 'i');

      filter = {
        $or: [
          // Search in Project Name (Partial match, Case Insensitive)
          { name: { $regex: searchRegex } },
          
          // Search in Description
          { description: { $regex: searchRegex } },
          
          // Search in Tech Stacks (Mongoose automatically checks if the array contains this value)
          { techStacks: searchRegex } 
        ],
      };
    }

    // 3. Pass the filter to Mongoose (Replacing Prisma findMany)
    const projects = await PortfolioProject.find(filter)
      .sort({ createdAt: -1 }); // Replaces orderBy: { createdAt: 'desc' }

    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};

// Use ESM export to match your project type
export { getPortfolioProjects };