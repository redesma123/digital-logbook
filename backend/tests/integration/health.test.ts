import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';

describe('GET /api/v1/health', () => {
  it('should return 200 and health message', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      statusCode: 200,
      success: true,
      message: 'HYDRO-MON API is running',
    });
  });
});
