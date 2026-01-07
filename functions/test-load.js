try {
    require('./index.js');
    console.log('Syntax check passed');
} catch (e) {
    console.error('Syntax check failed:', e);
    process.exit(1);
}
