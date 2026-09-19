import { describe, expect, it } from 'vitest';
import { loginSchema } from './auth.validator.js';
import { createTaskSchema, updateTaskStatusSchema, taskListQuerySchema } from './task.validator.js';
import { TaskPriority, TaskStatus } from '../config/enums.js';

describe('validators', () => {
  describe('loginSchema', () => {
    it('validates correct email and password', () => {
      const valid = { email: 'admin@dashboard.local', password: 'Password123!' };
      const parsed = loginSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const invalid = { email: 'notanemail', password: 'Password123!' };
      const parsed = loginSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });

    it('rejects too short password', () => {
      const invalid = { email: 'admin@dashboard.local', password: '123' };
      const parsed = loginSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });

  describe('task validators', () => {
    it('validates task creation payload', () => {
      const valid = {
        title: 'Complete test suite',
        projectId: 'cl12345678901234567890123',
        priority: TaskPriority.HIGH,
        status: TaskStatus.TODO,
      };
      expect(createTaskSchema.safeParse(valid).success).toBe(true);
    });

    it('validates task status update', () => {
      expect(updateTaskStatusSchema.safeParse({ status: TaskStatus.IN_PROGRESS }).success).toBe(
        true,
      );
      expect(updateTaskStatusSchema.safeParse({ status: 'INVALID_STATUS' }).success).toBe(false);
    });

    it('coerces query parameters for task list', () => {
      const query = {
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        dueFrom: '2026-09-01',
        dueTo: '2026-09-30',
      };
      const parsed = taskListQuerySchema.safeParse(query);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.dueFrom).toBeInstanceOf(Date);
        expect(parsed.data.dueTo).toBeInstanceOf(Date);
      }
    });
  });
});
