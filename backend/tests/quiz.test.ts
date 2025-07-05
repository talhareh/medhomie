import { app } from '../src/server';
import request from 'supertest';
import { Quiz } from '../src/models/Quiz';
import { Question } from '../src/models/Question';
import { QuizAttempt } from '../src/models/QuizAttempt';
import mongoose from 'mongoose';
import { User } from '../src/models/User';

// Test Data Factories
const createTestUser = async () => {
  return await User.create({
    email: 'test@example.com',
    password: 'password123',
    role: 'instructor',
    fullName: 'Johnie Boy',
    whatsappNumber: '+923200569079'
  });
};

const getAuthToken = async (user: any) => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: 'password123' });
  return res.body.token;
};

describe('Quiz API', () => {
  let authToken: string;
  let quizId: string;
  let questionId: string;
  let testUser: any;
  let mongooseConnection: mongoose.Connection;
  let server: any;

  beforeAll(async () => {
    // Disable server's default database connection
    process.env.DISABLE_DB_CONNECT = 'true';
    
    // Create test database connection
    mongooseConnection = mongoose.createConnection(process.env.MONGO_URI_TEST || '');
    
    // Start test server
    server = app.listen(5000);
    
    // Create test user and get token
    testUser = await createTestUser();
    authToken = await getAuthToken(testUser);
  });

  afterEach(async () => {
    await Quiz.deleteMany({});
    await Question.deleteMany({});
    await QuizAttempt.deleteMany({});
  });

  afterAll(async () => {
    // Close test server
    await new Promise<void>((resolve, reject) => {
      server.close((err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Close test database connection
    if (mongooseConnection) {
      await mongooseConnection.close();
    }
    
    // Clean up email service
    if (process.env.NODE_ENV === 'test') {
      const { transporter } = require('../src/services/emailService');
      await transporter.close();
    }
    
    // Clean up user
    await User.deleteMany({});
  });

  describe('Quiz CRUD Operations', () => {
    test('Create Quiz', async () => {
      const res = await request(app)
        .post('/api/quizzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Quiz',
          description: 'Test Description',
          passingScore: 70,
          maxAttempts: 3
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body.title).toEqual('Test Quiz');
      quizId = res.body._id;
    });

    test('Get Quiz', async () => {
      const res = await request(app)
        .get(`/api/quizzes/${quizId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toEqual('Test Quiz');
    });

    test('Update Quiz', async () => {
      const res = await request(app)
        .patch(`/api/quizzes/${quizId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Test Quiz',
          description: 'Updated Test Description',
          passingScore: 80,
          maxAttempts: 4
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toEqual('Updated Test Quiz');
    });

    test('Delete Quiz', async () => {
      const res = await request(app)
        .delete(`/api/quizzes/${quizId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toEqual(204);
    });

    test('Get All Quizzes', async () => {
      const res = await request(app)
        .get('/api/quizzes');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('Question Management', () => {
    test('Add Question with Image', async () => {
      const res = await request(app)
        .post(`/api/quizzes/${quizId}/questions`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', 'test/test-image.jpg')
        .field('questionText', 'Test Question')
        .field('questionType', 'MULTIPLE_CHOICE');
      expect(res.statusCode).toEqual(201);
      expect(res.body.imageUrl).toBeDefined();
      questionId = res.body._id;
    });

    test('Get Question', async () => {
      const res = await request(app)
        .get(`/api/quizzes/${quizId}/questions/${questionId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.questionText).toEqual('Test Question');
    });

    test('Update Question', async () => {
      const res = await request(app)
        .patch(`/api/quizzes/${quizId}/questions/${questionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          questionText: 'Updated Test Question',
          questionType: 'TRUE_FALSE'
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.questionText).toEqual('Updated Test Question');
    });

    test('Delete Question', async () => {
      const res = await request(app)
        .delete(`/api/quizzes/${quizId}/questions/${questionId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toEqual(204);
    });

    test('Get All Questions', async () => {
      const res = await request(app)
        .get(`/api/quizzes/${quizId}/questions`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('Quiz Attempts', () => {
    test('Start Attempt', async () => {
      const res = await request(app)
        .post(`/api/quizzes/${quizId}/attempts`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toEqual(201);
      expect(res.body.attemptNumber).toEqual(1);
    });

    test('Submit Answer', async () => {
      const attemptId = (await request(app)
        .post(`/api/quizzes/${quizId}/attempts`)
        .set('Authorization', `Bearer ${authToken}`)).body._id;
      const res = await request(app)
        .post(`/api/quizzes/${quizId}/attempts/${attemptId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          questionId: questionId,
          answer: 'Test Answer'
        });
      expect(res.statusCode).toEqual(200);
    });

    test('Get Attempt', async () => {
      const attemptId = (await request(app)
        .post(`/api/quizzes/${quizId}/attempts`)
        .set('Authorization', `Bearer ${authToken}`)).body._id;
      const res = await request(app)
        .get(`/api/quizzes/${quizId}/attempts/${attemptId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.attemptNumber).toEqual(1);
    });

    test('Get All Attempts', async () => {
      const res = await request(app)
        .get(`/api/quizzes/${quizId}/attempts`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('Analytics', () => {
    test('Get Quiz Statistics', async () => {
      const res = await request(app)
        .get(`/api/quizzes/${quizId}/statistics`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toEqual(200);
    });

    test('Get Question Statistics', async () => {
      const res = await request(app)
        .get(`/api/quizzes/${quizId}/questions/${questionId}/statistics`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toEqual(200);
    });
  });
});
