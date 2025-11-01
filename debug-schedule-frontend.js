// Debug script for schedule frontend
// Run this in the browser console on http://localhost:5173/schedule

console.log('🔍 Starting schedule frontend debug...');

// Test 1: Check if we're on the right page
console.log('Current URL:', window.location.href);

// Test 2: Check if Vue app is loaded
if (typeof window.Vue !== 'undefined') {
    console.log('✅ Vue is available');
} else {
    console.log('⚠️ Vue not available in global scope');
}

// Test 3: Check if we can access the schedule service
async function testScheduleService() {
    console.log('🧪 Testing schedule service...');
    
    try {
        // Try to make a direct API call
        const response = await fetch('/api/schedules', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Schedule API accessible');
            console.log('Total schedules:', data.data?.length || 0);
            return data;
        } else {
            console.error('❌ Schedule API failed:', response.status);
            return null;
        }
    } catch (error) {
        console.error('❌ Schedule API error:', error);
        return null;
    }
}

// Test 4: Check specific group schedules
async function testGroupSchedules(groupId = 'b23ce3b0-86ea-4a10-9c3c-4976f4273069') {
    console.log('🧪 Testing group schedules for:', groupId);
    
    try {
        const response = await fetch(`/api/schedules/group/${groupId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Group schedules API accessible');
            console.log('Group schedules:', data.data?.length || 0);
            
            if (data.data && data.data.length > 0) {
                console.log('Sample schedule:', data.data[0]);
                
                // Test time format conversion
                const schedule = data.data[0];
                const convertedTime = schedule.start_time.substring(0, 5);
                console.log('Original time:', schedule.start_time);
                console.log('Converted time:', convertedTime);
                console.log('Day:', schedule.day_of_week);
            }
            
            return data;
        } else {
            console.error('❌ Group schedules API failed:', response.status);
            return null;
        }
    } catch (error) {
        console.error('❌ Group schedules API error:', error);
        return null;
    }
}

// Test 5: Check courses API
async function testCourses() {
    console.log('🧪 Testing courses API...');
    
    try {
        const response = await fetch('/api/courses?school_id=1', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Courses API accessible');
            console.log('Total courses:', data.data?.length || 0);
            
            if (data.data && data.data.length > 0) {
                console.log('Sample course:', data.data[0]);
            }
            
            return data;
        } else {
            console.error('❌ Courses API failed:', response.status);
            return null;
        }
    } catch (error) {
        console.error('❌ Courses API error:', error);
        return null;
    }
}

// Test 6: Check groups API
async function testGroups() {
    console.log('🧪 Testing groups API...');
    
    try {
        const response = await fetch('/api/groups', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Groups API accessible');
            console.log('Total groups:', data.data?.length || 0);
            
            if (data.data && data.data.length > 0) {
                console.log('Sample group:', data.data[0]);
            }
            
            return data;
        } else {
            console.error('❌ Groups API failed:', response.status);
            return null;
        }
    } catch (error) {
        console.error('❌ Groups API error:', error);
        return null;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Running all schedule frontend tests...');
    
    const schedules = await testScheduleService();
    const groups = await testGroups();
    const courses = await testCourses();
    const groupSchedules = await testGroupSchedules();
    
    console.log('📊 Test Results Summary:');
    console.log('Schedules API:', schedules ? '✅ Working' : '❌ Failed');
    console.log('Groups API:', groups ? '✅ Working' : '❌ Failed');
    console.log('Courses API:', courses ? '✅ Working' : '❌ Failed');
    console.log('Group Schedules API:', groupSchedules ? '✅ Working' : '❌ Failed');
    
    return {
        schedules,
        groups,
        courses,
        groupSchedules
    };
}

// Auto-run tests
runAllTests().then(results => {
    console.log('🏁 Debug complete. Results:', results);
    
    // Check if we have the data needed for the schedule table
    if (results.groups && results.courses && results.groupSchedules) {
        console.log('✅ All required data is available for schedule table');
        
        // Simulate the frontend data processing
        if (results.groupSchedules.data && results.groupSchedules.data.length > 0) {
            const processedSchedules = results.groupSchedules.data.map(schedule => ({
                id: schedule.id,
                day: schedule.day_of_week,
                startTime: schedule.start_time.substring(0, 5),
                endTime: schedule.end_time.substring(0, 5),
                subject: schedule.course_id || schedule.subject || 'general',
                teacher: schedule.teacher?.firstName ? `${schedule.teacher.firstName} ${schedule.teacher.lastName}` : 'غير محدد',
                room: schedule.room?.name || 'غير محدد',
                notes: schedule.notes || '',
                courseId: schedule.course_id,
                teacherId: schedule.teacher_id,
                groupId: schedule.group_id
            }));
            
            console.log('📋 Processed schedules for frontend:', processedSchedules);
            
            // Test time slot matching
            const timeSlots = ['08:00', '08:45', '09:30', '10:15', '11:00', '11:45', '12:30', '13:15'];
            const weekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
            
            console.log('🕐 Testing time slot matching...');
            timeSlots.forEach(time => {
                weekDays.forEach(day => {
                    const match = processedSchedules.find(cls => cls.startTime === time && cls.day === day);
                    if (match) {
                        console.log(`✅ Found class at ${time} on ${day}:`, match.subject);
                    }
                });
            });
        }
    } else {
        console.log('❌ Missing required data for schedule table');
    }
});

// Export functions for manual testing
window.debugSchedule = {
    testScheduleService,
    testGroupSchedules,
    testCourses,
    testGroups,
    runAllTests
};
