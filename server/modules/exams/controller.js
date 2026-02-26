const Exam = require('./model');
const Question = require('../questions/model');


exports.createExam = async (req, res) => {
    try {
        req.body.teacher = req.user.id;
        const exam = await Exam.create(req.body);
        res.status(201).json({ success: true, data: exam });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};


exports.getExams = async (req, res) => {
    try {
        let query;


        if (req.user.role === 'student') {
            query = Exam.find({ isPublished: true });
        } else if (req.user.role === 'teacher') {
            query = Exam.find({ teacher: req.user.id });
        } else {
            query = Exam.find();
        }

        const exams = await query.populate('teacher', 'name');
        res.status(200).json({ success: true, count: exams.length, data: exams });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};


const recalculateTotalMarks = async (examId) => {
    const questions = await Question.find({ exam: examId });
    const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
    await Exam.findByIdAndUpdate(examId, { totalMarks });
    return totalMarks;
};


exports.getExam = async (req, res) => {
    try {

        await recalculateTotalMarks(req.params.id);

        const exam = await Exam.findById(req.params.id).populate('questions');

        if (!exam) {
            return res.status(404).json({ success: false, error: 'Exam not found' });
        }

        res.status(200).json({ success: true, data: exam });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};


exports.updateExam = async (req, res) => {
    try {
        let exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ success: false, error: 'Exam not found' });
        }


        if (exam.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });


        await recalculateTotalMarks(req.params.id);
        const updatedExam = await Exam.findById(req.params.id).populate('questions');

        res.status(200).json({ success: true, data: updatedExam });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};


exports.deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ success: false, error: 'Exam not found' });
        }


        if (exam.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        await exam.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

