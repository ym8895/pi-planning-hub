import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const art = await p.aRT.findFirst();
  console.log('ART:', art?.name);
  const pis = await p.pI.findMany();
  console.log('PIs:', pis.length);
  pis.forEach(pi => console.log(`  ${pi.name} - ${pi.status}`));
  const teams = await p.team.count();
  const features = await p.feature.count();
  const stories = await p.story.count();
  console.log('Teams:', teams, 'Features:', features, 'Stories:', stories);
}
main().catch(e => console.error('ERR:', e.message)).finally(() => p.$disconnect());
