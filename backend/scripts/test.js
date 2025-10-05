console.log('Test script starting...');

const testAsync = async () => {
  console.log('Inside async function');
  try {
    console.log('Testing basic functionality');
    return true;
  } catch (error) {
    console.error('Error in test:', error);
  }
};

console.log('About to call async function');
testAsync().then(() => {
  console.log('Test completed successfully');
}).catch((error) => {
  console.error('Test failed:', error);
});

console.log('Test script ending...');
