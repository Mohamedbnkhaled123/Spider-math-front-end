import { getMcqOptionLabel, cleanOptionText, MCQ_OPTION_LABELS } from './option-formatter.util';

describe('OptionFormatterUtil', () => {
  it('should return a:, b:, c:, d: for indices 0, 1, 2, 3', () => {
    expect(getMcqOptionLabel(0)).toBe('a:');
    expect(getMcqOptionLabel(1)).toBe('b:');
    expect(getMcqOptionLabel(2)).toBe('c:');
    expect(getMcqOptionLabel(3)).toBe('d:');
    expect(getMcqOptionLabel(4)).toBe('e:');
    expect(getMcqOptionLabel(5)).toBe('6:');
  });

  it('should strip redundant option prefixes without destroying math content', () => {
    expect(cleanOptionText('a: 42')).toBe('42');
    expect(cleanOptionText('A: 42')).toBe('42');
    expect(cleanOptionText('(b) 3.14')).toBe('3.14');
    expect(cleanOptionText('c. 100')).toBe('100');
    expect(cleanOptionText('d) 5')).toBe('5');
    expect(cleanOptionText('e: 99')).toBe('99');
    expect(cleanOptionText('E) 7')).toBe('7');
    expect(cleanOptionText('أ: 10')).toBe('10');
    expect(cleanOptionText('ب) 20')).toBe('20');
    expect(cleanOptionText('15')).toBe('15');
    expect(cleanOptionText('$x = a$')).toBe('$x = a$');
    expect(cleanOptionText('a')).toBe('a');
    expect(cleanOptionText('')).toBe('');
    expect(cleanOptionText(null)).toBe('');
    expect(cleanOptionText(undefined)).toBe('');
  });
});
