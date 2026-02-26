const Question = require('./model');
const Exam = require('../exams/model');


exports.addQuestion = async (req, res) => {
    try {
        const { examId } = req.body;
        const exam = await Exam.findById(examId);

        if (!exam) {
            return res.status(404).json({ success: false, error: 'Exam not found' });
        }


        if (exam.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        const question = await Question.create({
            ...req.body,
            exam: examId
        });


        await Exam.findByIdAndUpdate(examId, {
            $push: { questions: question._id },
            $inc: { totalMarks: Number(question.marks) }
        });

        res.status(201).json({ success: true, data: question });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};


exports.deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ success: false, error: 'Question not found' });
        }

        const exam = await Exam.findById(question.exam);


        if (exam.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }


        await Exam.findByIdAndUpdate(question.exam, {
            $pull: { questions: req.params.id },
            $inc: { totalMarks: -Number(question.marks) }
        });

        await question.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        let question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ success: false, error: 'Question not found' });
        }

        const exam = await Exam.findById(question.exam);


        if (exam.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }


        if (req.body.marks && Number(req.body.marks) !== question.marks) {
            const diff = Number(req.body.marks) - question.marks;
            await Exam.findByIdAndUpdate(question.exam, {
                $inc: { totalMarks: diff }
            });
        }

        question = await Question.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: question });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

