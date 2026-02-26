const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

const app = express();


connectDB();

const path = require('path');


app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/', (req, res) => {
    res.send('Online Examination System API is running...');
});


const authRoutes = require('./modules/auth/routes');
const examRoutes = require('./modules/exams/routes');
const questionRoutes = require('./modules/questions/routes');
const submissionRoutes = require('./modules/submissions/routes');
const materialRoutes = require('./modules/materials/routes');
const chatbotRoutes = require('./modules/chatbot/routes');

app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/chatbot', chatbotRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;

