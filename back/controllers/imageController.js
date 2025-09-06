const asyncHandler = require("express-async-handler");
const Replicate = require('replicate');

const replicate = new Replicate({auth: process.env.REPLICATE_API_TOKEN})

exports.generate = asyncHandler(async (req, res, next) => {
    try {
        const { prompt } = req.body;

        if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
            return res.status(400).json({ message: 'Prompt is required and must be a non-empty string.' });
        }

        // The user mentioned to fix the replicate library usage.
        // The original code was using "black-forest-labs/flux-pro".
        // Based on research on the replicate website, the correct model name seems to be "black-forest-labs/flux-1.1-pro".
        // I could not find a specific version hash for this model, so I am using the name.
        const model = "black-forest-labs/flux-1.1-pro";
        const input = {
            prompt: prompt
        };

        const output = await replicate.run(model, { input });

        if (!output || !Array.isArray(output) || output.length === 0) {
            throw new Error('Failed to generate image or received an empty response.');
        }

        res.status(200).json({ image: output[0] });
    }
    catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        // It's better to send a JSON response for errors as well.
        res.status(500).json({ message: `Error when generating an image: ${errorMessage}` });
    }
});
