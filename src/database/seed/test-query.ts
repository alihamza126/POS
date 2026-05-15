import { CustomerRepository } from '../../features/customers/repositories/customer-repository';
import { app } from 'electron';

// Mock electron app if needed, but since we are running in node it might be tricky
// Better to just mock the db path or use the existing one if we can.

async function test() {
  console.log('Testing CustomerRepository.findAll...');
  try {
    const result = await CustomerRepository.findAll({
      branchId: 'branch_01',
      limit: 10,
      offset: 0
    });
    console.log('Success! Found', result.items.length, 'customers.');
    console.log('First customer balance:', result.items[0]?.balance);
  } catch (error) {
    console.error('Error during findAll:', error);
  }
}

test();
