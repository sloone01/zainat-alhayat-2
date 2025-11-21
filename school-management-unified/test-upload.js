// Simple test script to test file upload
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function testUpload() {
  try {
    console.log('🧪 Testing file upload to backend...');
    
    // Use an existing image file
    const imagePath = '/tmp/test-image.png';

    // Create form data
    const formData = new FormData();
    formData.append('files', fs.createReadStream(imagePath));
    formData.append('session_plan_id', 'a861d053-aeac-4806-b5bf-2bc428478e03');
    formData.append('uploaded_by', '0f851929-30b0-4b1c-8f64-779bd03dae03');
    
    console.log('📤 Sending upload request...');
    
    const response = await axios.post('http://localhost:3003/api/session-media/upload-multiple', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    
    console.log('✅ Upload successful!');
    console.log('📥 Response:', response.data);
    
    if (response.data.success) {
      console.log('🎉 Backend returned success: true');
      console.log('📁 Uploaded files:', response.data.data.length);
      console.log('💬 Message:', response.data.message);
    } else {
      console.log('❌ Backend returned success: false');
      console.log('💬 Message:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    
    if (error.response) {
      console.error('📥 Error response status:', error.response.status);
      console.error('📥 Error response data:', error.response.data);
    }
  }
}

testUpload();
