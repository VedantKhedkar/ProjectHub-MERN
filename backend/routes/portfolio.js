import express from 'express';
import prisma from '../lib/prisma.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { portfolioImageUpload } from '../upload/projectUpload.js'; // Cloudinary middleware

const router = express.Router();

// Helper function to split comma-separated strings into an array
const stringToArray = (str) => {
    if (!str) return [];
    return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
};

// --- PUBLIC ROUTES ---

// GET /api/portfolio (UPDATED WITH SEARCH)
router.get('/', async (req, res) => {
    const { search } = req.query; // Extract search term

    try {
        let queryOptions = {
            orderBy: { createdAt: 'desc' },
        };

        // If a search term exists, filter the results
        if (search) {
            queryOptions.where = {
                OR: [
                    // 1. Search in Name (Case Insensitive)
                    { name: { contains: search, mode: 'insensitive' } },
                    
                    // 2. Search in Description (Case Insensitive)
                    { description: { contains: search, mode: 'insensitive' } },
                    
                    // 3. Search in Tech Stacks (Exact Match in Array)
                    // Note: This checks if the array contains the exact string
                    { techStacks: { has: search } } 
                ]
            };
        }

        const projects = await prisma.portfolioProject.findMany(queryOptions);
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
        const project = await prisma.portfolioProject.findUnique({
            where: { id: id },
        });

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

    // Extract fields
    const { name, description, demoUrl, price } = projectData; 

    if (!name || !description || !projectData.techStacks || !demoUrl || !price) {
        return res.status(400).json({ message: 'Missing required fields (Name, Description, Tech Stacks, Demo URL, Price).' });
    }

    try {
        let imageUrls = [];

        // Use file.path (Cloudinary URL)
        if (files && files.length > 0) {
            imageUrls = files.map(file => file.path);
        } else {
            return res.status(400).json({ message: 'At least one image is required for the portfolio.' });
        }

        const newPortfolioProject = await prisma.portfolioProject.create({
            data: {
                name,
                description,
                demoUrl,
                price, 
                features: stringToArray(projectData.features),
                techStacks: stringToArray(projectData.techStacks),
                imageUrls, 
            },
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

        // Handle Image Update (Cloudinary)
        if (files && files.length > 0) {
            // New files uploaded -> Use Cloudinary URLs
            const uploadedPaths = files.map(file => file.path);
            updateData.imageUrls = uploadedPaths;
        } else if (projectData.imageUrls) {
            // No new files -> Keep existing URLs
            updateData.imageUrls = stringToArray(projectData.imageUrls);
        }

        const updatedProject = await prisma.portfolioProject.update({
            where: { id: id },
            data: updateData, 
        });

        res.status(200).json({
            message: 'Portfolio project updated successfully.',
            project: updatedProject,
        });
    } catch (error) {
        console.error('Update Portfolio Error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Project not found.' });
        }
        res.status(500).json({ message: 'Internal server error.' });
    }
});


// DELETE /api/portfolio/:id (DELETE PROJECT)
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        // Only delete the database record (Files remain in Cloudinary or can be deleted via separate Admin tool)
        await prisma.portfolioProject.delete({
            where: { id: id },
        });

        res.status(200).json({ message: 'Portfolio project deleted successfully.' });

    } catch (error) {
        console.error('Delete Portfolio Error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Project not found.' });
        }
        res.status(500).json({ message: 'Internal server error.' });
    }
});

export default router;