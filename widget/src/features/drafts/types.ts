export type Draft = { id: string; platformId: number; text: string; createdAt: string; updatedAt: string; hasImage: boolean };

export const platforms = [
  { id: 1, name: 'Instagram', mark: '◎', color: 'bg-[#f9ebef] text-[#c36686]' },
  { id: 2, name: 'LinkedIn', mark: 'in', color: 'bg-[#e9f2f8] text-[#4380a6]' },
  { id: 3, name: 'X', mark: '𝕏', color: 'bg-[#eceeed] text-[#303936]' },
  { id: 4, name: 'Facebook', mark: 'f', color: 'bg-[#ebf0fc] text-[#547bc2]' },
];



