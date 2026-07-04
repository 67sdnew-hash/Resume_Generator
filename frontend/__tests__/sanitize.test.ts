import { describe, it, expect } from 'vitest';
import { sanitizeProfileForSend } from '../lib/api';
import { emptyProfile } from '../lib/types';

describe('sanitizeProfileForSend', () => {
  it('removes empty experience and education entries and normalizes contact', () => {
    const input = {
      ...emptyProfile,
      contact: { fullName: '', email: '', linkedin: '   ', portfolio: '' },
      experience: [
        { company: '', title: '', startDate: '', endDate: '', bullets: [''] },
      ],
      education: [{ institution: '', degree: '' }],
    } as any;

    const out = sanitizeProfileForSend(input);

    expect(out.experience).toEqual([]);
    expect(out.education).toEqual([]);
    expect(out.contact.email).toBeUndefined();
    expect(out.contact.linkedin).toBeUndefined();
  });

  it('keeps valid experience entries and trims bullets', () => {
    const input = {
      ...emptyProfile,
      contact: { fullName: ' Alice ', email: 'alice@example.com' },
      experience: [
        { company: 'Acme', title: 'Eng', startDate: '2020-01', bullets: ['  did X  ', ''] },
      ],
    } as any;

    const out = sanitizeProfileForSend(input);
    expect(out.experience.length).toBe(1);
    expect(out.experience[0].bullets).toEqual(['did X']);
    expect(out.contact.fullName).toBe('Alice');
    expect(out.contact.email).toBe('alice@example.com');
  });
});
