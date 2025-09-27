const id = Math.random();
// This log will appear in your console each time the module is executed.
console.log(`[my-cjs-module] Module instance created with ID: ${id}`);

module.exports = { id };