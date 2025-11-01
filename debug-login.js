// Debug script to test login functionality
// Run this in the browser console on http://localhost:5173

console.log('🔍 Starting login debug...');

// Test 1: Check if API base URL is correct
console.log('API Base URL:', 'http://localhost:3002/api');

// Test 2: Test direct fetch call
async function testDirectLogin() {
    console.log('🧪 Testing direct login...');
    
    try {
        const response = await fetch('http://localhost:3002/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@zinatalhaykindergarten.com',
                password: 'admin123'
            })
        });
        
        console.log('✅ Response status:', response.status);
        console.log('✅ Response headers:', [...response.headers.entries()]);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Login response:', data);
            return data;
        } else {
            const errorText = await response.text();
            console.error('❌ Login failed:', errorText);
            return null;
        }
    } catch (error) {
        console.error('❌ Network error:', error);
        return null;
    }
}

// Test 3: Test axios call (like the app does)
async function testAxiosLogin() {
    console.log('🧪 Testing axios login...');
    
    try {
        // Import axios if available
        if (typeof axios !== 'undefined') {
            const response = await axios.post('http://localhost:3002/api/auth/login', {
                email: 'admin@zinatalhaykindergarten.com',
                password: 'admin123'
            });
            
            console.log('✅ Axios response:', response.data);
            return response.data;
        } else {
            console.log('⚠️ Axios not available in global scope');
            return null;
        }
    } catch (error) {
        console.error('❌ Axios error:', error);
        return null;
    }
}

// Test 4: Check localStorage
function checkLocalStorage() {
    console.log('🧪 Checking localStorage...');
    console.log('Auth token:', localStorage.getItem('auth_token'));
    console.log('User data:', localStorage.getItem('user_data'));
}

// Test 5: Check if Vue app is loaded
function checkVueApp() {
    console.log('🧪 Checking Vue app...');
    console.log('Vue available:', typeof Vue !== 'undefined');
    console.log('Router available:', typeof router !== 'undefined');
    console.log('Current route:', window.location.pathname);
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Running all login debug tests...');
    
    checkVueApp();
    checkLocalStorage();
    
    const directResult = await testDirectLogin();
    const axiosResult = await testAxiosLogin();
    
    console.log('📊 Test Results Summary:');
    console.log('Direct fetch:', directResult ? '✅ Success' : '❌ Failed');
    console.log('Axios call:', axiosResult ? '✅ Success' : '❌ Failed');
    
    return {
        direct: directResult,
        axios: axiosResult
    };
}

// Auto-run tests
runAllTests().then(results => {
    console.log('🏁 Debug complete. Results:', results);
});

// Export functions for manual testing
window.debugLogin = {
    testDirectLogin,
    testAxiosLogin,
    checkLocalStorage,
    checkVueApp,
    runAllTests
};
