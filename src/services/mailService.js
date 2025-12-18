import axios from 'axios';

const API_URL = 'http://localhost:3002/api/mails'; // Fixed: mails instead of mail

export const fetchInboxEmails = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/inbox`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching inbox emails:', error);
    throw error;
  }
};

export const fetchSentEmails = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/sent`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching sent emails:', error);
    throw error;
  }
};

export const sendEmail = async (emailData, token) => {
  try {
    // Try global send first (supports external emails)
    let response;
    try {
      response = await axios.post(`${API_URL}/send-global`, emailData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (globalError) {
      console.log('Global send failed, trying regular send:', globalError.message);
      // Fallback to regular send
      response = await axios.post(`${API_URL}/send`, emailData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    }
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const fetchEmailDetails = async (emailId, token) => {
  try {
    const response = await axios.get(`${API_URL}/emails/${emailId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching email details:', error);
    throw error;
  }
};

