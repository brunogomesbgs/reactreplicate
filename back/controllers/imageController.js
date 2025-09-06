const asyncHandler = require("express-async-handler");
const Replicate = require('replicate');

const replicate = new Replicate({auth: process.env.REPLICATE_API_TOKEN})

exports.generate = asyncHandler(async (req, res, next) => {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        const error = new Error('Prompt is required and must be a non-empty string.');
        error.status = 400;
        return next(error);
    }

    const model = "black-forest-labs/flux-1.1-pro";
    const input = {
        prompt: prompt
    };

    const output = await replicate.run(model, { input });

    if (!output || !Array.isArray(output) || output.length === 0) {
        const error = new Error('Failed to generate image or received an empty response.');
        error.status = 500;
        return next(error);
    }

    res.status(200).json({ image: output[0] });
});
