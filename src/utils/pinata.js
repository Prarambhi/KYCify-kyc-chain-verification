import axios from 'axios';
import fs from 'fs';

const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_SECRET = process.env.REACT_APP_PINATA_SECRET;

// For file uploads
export const pinFileToIPFS = async (file) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  
  const data = new FormData();
  data.append('file', file);

  const response = await axios.post(url, data, {
    headers: {
      'Content-Type': `multipart/form-data`,
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET,
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  return {
    ipfsHash: response.data.IpfsHash,
    pinSize: response.data.PinSize,
    timestamp: response.data.Timestamp,
  };
};

// For JSON metadata (optional)
export const pinJSONToIPFS = async (json) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  
  const response = await axios.post(url, json, {
    headers: {
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET,
    },
  });

  return response.data.IpfsHash;
};