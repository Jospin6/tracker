const email = process.argv[2];

if (!email) {
  console.log('Usage: node analyse-email.js "your-email@example.com"');
  process.exit(1);
}

console.log('🔍 Analyse de l\'email:', email);
console.log('');

// Vérifications de base
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
console.log('✅ Format valide:', emailRegex.test(email));

// Extraction du domaine
const domain = email.split('@')[1]?.toLowerCase();
console.log('📧 Domaine:', domain);

// Liste des domaines jetables courants
const disposableDomains = [
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'temp-mail.org',
  'throwaway.email',
  'tempail.com',
  'yopmail.com',
  'maildrop.cc',
  'tempinbox.com',
  'dispostable.com'
];

const isDisposable = disposableDomains.includes(domain);
console.log('🚫 Domaine jetable:', isDisposable ? 'OUI ⚠️' : 'NON ✅');

// Mots suspects dans l'email
const suspiciousWords = ['temp', 'test', 'spam', 'fake', 'dummy', 'example', 'sample'];
const hasSuspiciousWords = suspiciousWords.some(word => email.toLowerCase().includes(word));
console.log('⚠️  Contient des mots suspects:', hasSuspiciousWords ? 'OUI ⚠️' : 'NON ✅');

console.log('');
console.log('💡 Recommandations:');
if (isDisposable) {
  console.log('   - Utilisez un email permanent (Gmail, Outlook, etc.)');
}
if (hasSuspiciousWords) {
  console.log('   - Évitez les mots comme "test", "temp", "fake" dans l\'email');
}
if (!emailRegex.test(email)) {
  console.log('   - Vérifiez le format de l\'email');
}

console.log('   - Essayez avec un email Gmail ou Outlook standard');