import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  process.stderr.write('Usage: node scripts/generate-hash.js "minha_senha_aqui"\n');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
process.stdout.write(`${hash}\n`);
