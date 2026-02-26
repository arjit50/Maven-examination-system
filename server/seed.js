const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./modules/users/model');
const Exam = require('./modules/exams/model');
const Question = require('./modules/questions/model');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/online-exam');

        
        await User.deleteMany();
        await Exam.deleteMany();
        await Question.deleteMany();

        
        const teacher = await User.create({
            name: 'Prof. Xavier',
            email: 'teacher@example.com',
            password: 'password123',
            role: 'teacher'
        });

        
        const student = await User.create({
            name: 'Tony Stark',
            email: 'student@example.com',
            password: 'password123',
            role: 'student'
        });

        
        const exam = await Exam.create({
            title: 'Advanced Robotics Quiz',
            description: 'Test your knowledge on modern robotics and AI integration.',
            subject: 'Engineering',
            teacher: teacher._id,
            duration: 10,
            totalMarks: 2,
            isPublished: true
        });

        
        const q1 = await Question.create({
            exam: exam._id,
            text: 'What does AI stand for?',
            options: [
                { text: 'Artificial Intelligence', isCorrect: true },
                { text: 'Automated Interaction', isCorrect: false },
                { text: 'Android Interface', isCorrect: false },
                { text: 'Aerial Intelligence', isCorrect: false }
            ],
            marks: 1
        });

        const q2 = await Question.create({
            exam: exam._id,
            text: 'Is robotics a branch of engineering?',
            type: 'tf',
            options: [
                { text: 'True', isCorrect: true },
                { text: 'False', isCorrect: false }
            ],
            marks: 1
        });

        exam.questions = [q1._id, q2._id];
        await exam.save();

        console.log('Data Seeded Successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();

