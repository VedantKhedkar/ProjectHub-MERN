import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { portfolioImageUpload } from '../upload/projectUpload.js'; 
import PortfolioProject from '../models/PortfolioProject.js'; // ✅ Replaced prisma import

const router = express.Router();

// Helper function to split comma-separated strings into an array (Logic Unchanged)
const stringToArray = (str) => {
    if (!str) return [];
    if (Array.isArray(str)) return str;
    return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
};

// --- PUBLIC ROUTES ---

// GET /api/portfolio (UPDATED WITH SEARCH)
router.get('/', async (req, res) => {
    const { search } = req.query; 

    try {
        let filter = {};

        // If a search term exists, filter the results using Mongoose logic
        if (search) {
            const searchRegex = new RegExp(search, 'i'); // Case-insensitive regex
            filter = {
                $or: [
                    // 1. Search in Name (Regex replaces Prisma 'contains')
                    { name: searchRegex },
                    
                    // 2. Search in Description
                    { description: searchRegex },
                    
                    // 3. Search in Tech Stacks (Mongoose handles array search automatically)
                    { techStacks: searchRegex } 
                ]
            };
        }

        // Mongoose 'find' with 'sort' replaces Prisma 'findMany' with 'orderBy'
        const projects = await PortfolioProject.find(filter).sort({ createdAt: -1 });
        res.status(200).json(projects);
    } catch (error) {
        console.error('Get Portfolio Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// GET /api/portfolio/:id
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // findById replaces findUnique
        const project = await PortfolioProject.findById(id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }
        res.status(200).json(project);
    } catch (error) {
        console.error('Get Single Project Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// --- ADMIN ROUTES (Protected) ---

// POST /api/portfolio (CREATE NEW PROJECT)
router.post('/', verifyToken, portfolioImageUpload, async (req, res) => {
    const projectData = req.body;
    const files = req.files;

    const { name, description, demoUrl, price } = projectData; 

    if (!name || !description || !projectData.techStacks || !demoUrl || !price) {
        return res.status(400).json({ message: 'Missing required fields (Name, Description, Tech Stacks, Demo URL, Price).' });
    }

    try {
        let imageUrls = [];

        if (files && files.length > 0) {
            imageUrls = files.map(file => file.path);
        } else {
            return res.status(400).json({ message: 'At least one image is required for the portfolio.' });
        }

        // Model.create replaces prisma.create
        const newPortfolioProject = await PortfolioProject.create({
            name,
            description,
            demoUrl,
            price, 
            features: stringToArray(projectData.features),
            techStacks: stringToArray(projectData.techStacks),
            imageUrls, 
        });

        res.status(201).json({
            message: 'Portfolio project added successfully to Cloud.',
            project: newPortfolioProject,
        });

    } catch (error) {
        console.error('Create Portfolio Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});


// PATCH /api/portfolio/:id (UPDATE PROJECT)
router.patch('/:id', verifyToken, portfolioImageUpload, async (req, res) => {
    const { id } = req.params;
    const projectData = req.body; 
    const files = req.files;

    if (!projectData.price) {
         return res.status(400).json({ message: 'Price field cannot be empty during update.' });
    }

    try {
        let updateData = {
            name: projectData.name,
            description: projectData.description,
            demoUrl: projectData.demoUrl,
            price: projectData.price,
            features: stringToArray(projectData.features),
            techStacks: stringToArray(projectData.techStacks),
        };

        if (files && files.length > 0) {
            updateData.imageUrls = files.map(file => file.path);
        } else if (projectData.imageUrls) {
            updateData.imageUrls = stringToArray(projectData.imageUrls);
        }

        // findByIdAndUpdate replaces prisma.update
        const updatedProject = await PortfolioProject.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true } // {new: true} ensures the updated document is returned
        );

        if (!updatedProject) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        res.status(200).json({
            message: 'Portfolio project updated successfully.',
            project: updatedProject,
        });
    } catch (error) {
        console.error('Update Portfolio Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});


// DELETE /api/portfolio/:id (DELETE PROJECT)
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        // findByIdAndDelete replaces prisma.delete
        const deletedProject = await PortfolioProject.findByIdAndDelete(id);

        if (!deletedProject) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        res.status(200).json({ message: 'Portfolio project deleted successfully.' });

    } catch (error) {
        console.error('Delete Portfolio Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

export default router;