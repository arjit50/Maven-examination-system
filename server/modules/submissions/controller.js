const Submission = require('./model');
const Exam = require('../exams/model');
const Question = require('../questions/model');


exports.submitExam = async (req, res) => {
    try {
        const { examId, answers, submissionType, warningCount } = req.body;

        const exam = await Exam.findById(examId).populate('questions');
        if (!exam) {
            return res.status(404).json({ success: false, error: 'Exam not found' });
        }


        let score = 0;
        const processedAnswers = [];

        for (const answer of answers) {
            const question = exam.questions.find(q => q._id.toString() === answer.questionId);
            if (question) {
                let isCorrect = false;
                if (question.type === 'mcq' || question.type === 'tf') {
                    const correctOption = question.options.find(opt => opt.isCorrect);
                    if (correctOption && correctOption.text === answer.selectedOption) {
                        score += question.marks;
                        isCorrect = true;
                    }
                }

                processedAnswers.push({
                    question: question._id,
                    selectedOption: answer.selectedOption,
                    textAnswer: answer.textAnswer
                });
            }
        }

        const submission = await Submission.create({
            student: req.user.id,
            exam: examId,
            answers: processedAnswers,
            score,
            status: 'graded',
            submissionType: submissionType || 'manual',
            warningCount: warningCount || 0
        });

        res.status(201).json({ success: true, data: submission });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};


exports.getMySubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ student: req.user.id }).populate('exam', 'title subject totalMarks passingMarks');
        res.status(200).json({ success: true, count: submissions.length, data: submissions });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};


exports.getExamSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ exam: req.params.examId }).populate('student', 'name email');
        res.status(200).json({ success: true, count: submissions.length, data: submissions });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

