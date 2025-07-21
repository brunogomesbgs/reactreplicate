const asyncHandler = require("express-async-handler");
const Replicate = require('replicate');

const replicate = new Replicate({auth: process.env.REPLICATE_API_TOKEN})

exports.generate = asyncHandler(async (req, res, next) => {
    try {
        if (req.body.prompt === '') {
            req.body.prompt = 'draw a house facade with wood and glass'
        }

        const model = "black-forest-labs/flux-pro"
        const input = {
            prompt: `${req.body.prompt}`
        };
        const [output] = await replicate.run(model, { input });
        res.status(200).send({ message: `Image generated from prompt: ${req.body.prompt}`, image: output.result });
        next()
    }
    catch (e) {
        //res.status(400).end({ message: `Error when creating an user, ${e}` });
        return next(`Error when generate an image, ${e}`)
    }
})
