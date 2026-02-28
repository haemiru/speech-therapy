const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Endpoint to save therapy metrics
app.post('/api/metrics', async (req, res) => {
    try {
        const { childId, exerciseType, duration, intensity, accuracy, date } = req.body;

        // Validate required fields
        if (!exerciseType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const metric = await prisma.therapyMetric.create({
            data: {
                childId: childId || "Leo Thompson", // Default for demo
                exerciseType,
                duration: duration ? parseFloat(duration) : null,
                intensity: intensity ? parseFloat(intensity) : null,
                accuracy: accuracy ? parseFloat(accuracy) : null,
                date: date ? new Date(date) : new Date(),
            }
        });

        res.status(201).json(metric);
    } catch (error) {
        console.error('Error saving metric:', error);
        res.status(500).json({ error: 'Failed to save metric' });
    }
});

// Endpoint to get metrics for dashboard
app.get('/api/metrics', async (req, res) => {
    try {
        const { childId } = req.query;

        const query = {};
        if (childId) {
            query.childId = childId;
        }

        const metrics = await prisma.therapyMetric.findMany({
            where: query,
            orderBy: { date: 'desc' },
            take: 50 // Limit to recent 50 for now
        });

        res.json(metrics);
    } catch (error) {
        console.error('Error fetching metrics:', error);
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
