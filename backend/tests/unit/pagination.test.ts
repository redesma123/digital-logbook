import { describe, it, expect } from 'vitest';
import { paginate, paginationArgs } from '../../src/utils/pagination.js';

describe('paginate', () => {
  it('should calculate correct totalPages', () => {
    expect(paginate(25, 1, 10)).toEqual({ total: 25, page: 1, limit: 10, totalPages: 3 });
  });
  it('should return 1 page for 0 records', () => {
    expect(paginate(0, 1, 10).totalPages).toBe(1);
  });
  it('should handle exact division', () => {
    expect(paginate(20, 2, 10).totalPages).toBe(2);
  });
});

describe('paginationArgs', () => {
  it('should calculate skip for page 1', () => {
    expect(paginationArgs(1, 10)).toEqual({ skip: 0, take: 10 });
  });
  it('should calculate skip for page 2', () => {
    expect(paginationArgs(2, 10)).toEqual({ skip: 10, take: 10 });
  });
});
