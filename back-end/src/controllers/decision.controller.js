import expressAsyncHandler from 'express-async-handler';

/**
 * @desc    Submit a decision request to ORACLE AI Engine
 * @route   POST /api/v1/decide
 * @access  Public
 */
export const makeDecision = expressAsyncHandler(async (req, res) => {
    const {
        problem_description,
        problem,
        user_input = "",
        language = "",
        memory_scope = "default"
    } = req.body;

    const problemText = problem_description || problem || req.body.prompt;

    if (!problemText || typeof problemText !== 'string' || !problemText.trim()) {
        return res.status(400).json({
            status: 'fail',
            message: 'problem_description is required',
            data: null
        });
    }

    let aiEndpoint = process.env.AI_API_URL || 'http://localhost:8000/decide';
    if (aiEndpoint.startsWith('/')) {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        const host = req.headers.host || 'localhost:5000';
        aiEndpoint = `${protocol}://${host}${aiEndpoint}`;
    }

    try {
        const aiResponse = await fetch(aiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                problem_description: problemText.trim(),
                user_input,
                language,
                memory_scope
            })
        });

        const data = await aiResponse.json();

        if (!aiResponse.ok) {
            return res.status(aiResponse.status).json({
                status: 'fail',
                message: data.detail || 'AI engine error',
                data: null
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Decision processed successfully',
            data
        });
    } catch (error) {
        console.error('Error connecting to ORACLE AI engine:', error);
        return res.status(502).json({
            status: 'fail',
            message: 'Unable to connect to ORACLE AI Engine on ' + aiEndpoint,
            data: null
        });
    }
});
