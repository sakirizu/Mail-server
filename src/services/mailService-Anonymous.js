// Mail service for handling email operations
const API_BASE_URL = 'http://10.2.145.211:4000/api';

export const mailService = {
  // Get user's emails (inbox)
  getEmails: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mail/inbox`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  },

  // Send email
  sendEmail: async (emailData, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mail/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },

  // Get sent emails
  getSentEmails: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mail/sent`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch sent emails');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching sent emails:', error);
      throw error;
    }
  },

  // Delete email
  deleteEmail: async (emailId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mail/${emailId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete email');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting email:', error);
      throw error;
    }
  }
};