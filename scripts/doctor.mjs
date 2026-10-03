import { cli, settings, state } from './core.mjs';
await cli(async args => {
  if (args.length) throw new Error('doctor accepts no arguments');
  const config = settings();
  const record = await state(config, true);
  console.log(`Local configuration only — no API requests.\nAccount: ${config.account}\nOwned run prefix: ${record.run}`);
  for (const product of ['images', 'stream', 'r2']) {
    try { settings(process.env, product); console.log(`${product}: environment configured (not a live permission check).`); }
    catch (error) { console.log(`${product}: ${error.message}`); process.exitCode = 1; }
  }
});
