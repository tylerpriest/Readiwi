import { cn } from '../cn';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('base-class', 'additional-class');
    expect(result).toContain('base-class');
    expect(result).toContain('additional-class');
  });

  it('should handle conditional classes', () => {
    const result = cn('base', true && 'conditional-true', false && 'conditional-false');
    expect(result).toContain('base');
    expect(result).toContain('conditional-true');
    expect(result).not.toContain('conditional-false');
  });

  it('should handle undefined values', () => {
    const result = cn('base', undefined, 'other');
    expect(result).toContain('base');
    expect(result).toContain('other');
  });
});