const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const config = require("./config.json");

const app = express();
const PORT = 3000;

const IMG_FOLDER = "output";
if (!fs.existsSync(IMG_FOLDER)) {
    fs.mkdirSync(IMG_FOLDER);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, IMG_FOLDER);
    },
    filename: (req, file, cb) => {
        cb(null, "your_image.png");
    },
});

const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, "public")));

app.post("/clip", upload.single("clippedImage"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("No clipped image uploaded");
    }

    const command = `${config.condaPath} run -n ${config.condaEnv} python demo.py --Transformation TPS --FeatureExtraction ResNet --SequenceModeling BiLSTM --Prediction Attn --image_folder output --saved_model best_accuracy.pth`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error("Error executing script:", stderr);
            return res.status(500).send("Error processing the file");
        }

        res.send(`${stdout}`);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
