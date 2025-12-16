import express from 'express';
import prisma from '../lib/prisma.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { portfolioImageUpload } from '../upload/projectUpload.js'; // <-- Multer handler

const router = express.Router();

// Helper function to split comma-separated strings into an array
const stringToArray = (str) => {
    if (!str) return [];
    return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
};

// --- PUBLIC ROUTES (Define first for correct Express routing priority) ---

// GET /api/portfolio
router.get('/', async (req, res) => {
    try {
        const projects = await prisma.portfolioProject.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(projects);
    } catch (error) {
        console.error('Get Portfolio Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// GET /api/portfolio/:id (MUST be defined before specific actions like POST/DELETE)
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

    // Extract fields, including the NEW 'price' field
    const { name, description, demoUrl, price } = projectData; 

    // Check required fields (Price is now required for creation)
    if (!name || !description || !projectData.techStacks || !demoUrl || !price) {
        return res.status(400).json({ message: 'Missing required fields (Name, Description, Tech Stacks, Demo URL, Price).' });
    }

    try {
        let imageUrls = [];

        // 1. Process File Uploads (Local Storage)
        if (files && files.length > 0) {
            imageUrls = files.map(file => `/uploads/${file.filename}`);
        } else {
            return res.status(400).json({ message: 'At least one image is required for the portfolio.' });
        }

        const newPortfolioProject = await prisma.portfolioProject.create({
            data: {
                name,
                description,
                demoUrl,
                price, // <--- SAVING NEW PRICE FIELD
                features: stringToArray(projectData.features),
                techStacks: stringToArray(projectData.techStacks),
                imageUrls, 
            },
        });

        res.status(201).json({
            message: 'Portfolio project added successfully with images.',
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

    // Check required fields (Price validation for update)
    if (!projectData.price) {
         return res.status(400).json({ message: 'Price field cannot be empty during update.' });
    }

    try {
        let updateData = {
            name: projectData.name,
            description: projectData.description,
            demoUrl: projectData.demoUrl,
            price: projectData.price, // <--- UPDATING NEW PRICE FIELD
            features: stringToArray(projectData.features),
            techStacks: stringToArray(projectData.techStacks),
        };

        // --- Handle Image Update ---
        if (files && files.length > 0) {
            // New files were uploaded. Overwrite existing image URLs.
            const uploadedPaths = files.map(file => `/uploads/${file.filename}`);
            updateData.imageUrls = uploadedPaths;
        } else if (projectData.imageUrls) {
            // Save the existing array back after conversion.
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
        // Find the project first to get file paths for local deletion
        const projectToDelete = await prisma.portfolioProject.findUnique({
             where: { id: id },
             select: { imageUrls: true }
        });

        // Perform local file cleanup (optional but good practice)
        if (projectToDelete && projectToDelete.imageUrls.length > 0) {
            const fs = await import('fs/promises');
            const path = await import('path');
            projectToDelete.imageUrls.forEach(urlPath => {
                // Ensure only relative paths are deleted
                if (urlPath.startsWith('/uploads/')) {
                    const filename = urlPath.replace('/uploads/', '');
                    fs.unlink(path.join(process.cwd(), 'uploads/', filename))
                      .catch(e => console.warn(`Could not delete file: ${filename}`, e));
                }
            });
        }
        
        // Delete the database entry
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