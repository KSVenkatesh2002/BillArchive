import { dbService } from '../db/dbService';

export const billService = {
  /**
   * Get all bills
   */
  async getBills() {
    const bills = await dbService.findBills();
    const isDemo = await dbService.isDemo();
    return {
      success: true,
      data: bills,
      isDemo
    };
  },

  /**
   * Create a new bill
   */
  async createBill(billData) {
    const { title, clientName, amount, status, date } = billData;

    if (!title || !clientName || !amount) {
      throw new Error('Missing required fields: title, clientName, amount');
    }

    const newBill = {
      title,
      clientName,
      amount: parseFloat(amount),
      status: status || 'Pending',
      date: date || new Date().toISOString().split('T')[0],
      createdAt: new Date()
    };

    const created = await dbService.createBill(newBill);
    const isDemo = await dbService.isDemo();

    return {
      success: true,
      data: created,
      isDemo
    };
  }
};
