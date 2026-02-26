const Material = require('./model');




exports.createMaterial = async (req, res) => {
    try {
        req.body.teacher = req.user.id;
        const material = await Material.create(req.body);
        res.status(201).json({ success: true, data: material });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};




exports.getMaterials = async (req, res) => {
    try {
        const materials = await Material.find().populate('teacher', 'name');
        res.status(200).json({ success: true, count: materials.length, data: materials });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};




exports.deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({ success: false, error: 'Material not found' });
        }

        
        if (material.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        await material.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};




exports.uploadMaterialFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please upload a file' });
        }

        const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        res.status(200).json({ success: true, data: fileUrl });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

