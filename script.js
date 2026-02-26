// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const backToTopBtn = document.getElementById('backToTop');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    // Hide loading overlay after page is loaded
    setTimeout(() => {
        loadingOverlay.classList.add('hidden');
    }, 1000);
    
    // Check if user is logged in on page load
    if (window.auth) {
        window.auth.onAuthStateChanged(user => {
            if (user) {
                // User is signed in
                updateUIForLoggedInUser(user);
                checkEmailVerificationStatus(user);
                loadUserProfile(user);
            } else {
                // User is signed out
                updateUIForLoggedOutUser();
            }
        });
    }
    
    // Check email verification status
    function checkEmailVerificationStatus(user) {
        if (!user) return;
        
        // Check if email is verified
        if (user.emailVerified) {
            updateEmailVerificationUI(true, user.email);
        } else {
            updateEmailVerificationUI(false, user.email);
            // Show verification modal if not verified
            if (!sessionStorage.getItem('verificationModalShown')) {
                showVerificationModal(user.email);
                sessionStorage.setItem('verificationModalShown', 'true');
            }
        }
    }
    
    // Update email verification UI
    function updateEmailVerificationUI(verified, email) {
        // Remove existing status
        const existingStatus = document.querySelector('.email-verification-status');
        if (existingStatus) {
            existingStatus.remove();
        }
        
        // Find user info element
        const userInfo = document.querySelector('.user-info');
        if (!userInfo) return;
        
        // Create status element
        const statusElement = document.createElement('div');
        statusElement.className = 'email-verification-status';
        
        if (verified) {
            statusElement.classList.add('status-verified');
            statusElement.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>Terverifikasi</span>
            `;
        } else {
            statusElement.classList.add('status-pending');
            statusElement.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                <span>Belum Terverifikasi</span>
            `;
        }
        
        // Insert status after user details
        const userDetails = userInfo.querySelector('.user-details');
        if (userDetails) {
            userDetails.appendChild(statusElement);
        }
    }
    
    // Show verification modal
    function showVerificationModal(email) {
        const verificationModal = document.getElementById('verificationModal');
        if (!verificationModal) return;
        
        verificationModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Set email
        const verificationEmail = document.getElementById('verificationEmail');
        if (verificationEmail) {
            verificationEmail.textContent = email;
        }
        
        // Set status
        const verificationStatus = document.getElementById('verificationStatus');
        if (verificationStatus) {
            verificationStatus.textContent = 'Menunggu Verifikasi';
            verificationStatus.className = 'status-pending';
        }
        
        // Setup resend button
        const resendBtn = document.getElementById('resendVerificationBtn');
        if (resendBtn) {
            resendBtn.onclick = () => resendVerificationEmail();
        }
        
        // Setup check button
        const checkBtn = document.getElementById('checkVerificationBtn');
        if (checkBtn) {
            checkBtn.onclick = () => checkVerificationStatus();
        }
    }
    
    // Hide verification modal
    function hideVerificationModal() {
        const verificationModal = document.getElementById('verificationModal');
        if (verificationModal) {
            verificationModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    // Close verification modal
    const closeVerificationModal = document.getElementById('closeVerificationModal');
    if (closeVerificationModal) {
        closeVerificationModal.addEventListener('click', hideVerificationModal);
    }
    
    // Resend verification email
    function resendVerificationEmail() {
        const user = window.auth.currentUser;
        if (!user) return;
        
        if (window.sendEmailVerification) {
            window.sendEmailVerification(user)
                .then(() => {
                    showNotification('Email verifikasi telah dikirim ulang!', 'success');
                    
                    // Update status
                    const verificationStatus = document.getElementById('verificationStatus');
                    if (verificationStatus) {
                        verificationStatus.textContent = 'Email telah dikirim ulang';
                    }
                })
                .catch((error) => {
                    showNotification('Error mengirim email verifikasi: ' + error.message, 'error');
                });
        }
    }
    
    // Check verification status
    function checkVerificationStatus() {
        const user = window.auth.currentUser;
        if (!user) return;
        
        if (user.reload) {
            user.reload()
                .then(() => {
                    // Check verification status after reload
                    setTimeout(() => {
                        if (user.emailVerified) {
                            updateEmailVerificationUI(true, user.email);
                            hideVerificationModal();
                            showNotification('Email berhasil diverifikasi!', 'success');
                        } else {
                            showNotification('Email belum diverifikasi. Silakan periksa email Anda.', 'warning');
                        }
                    }, 2000);
                })
                .catch((error) => {
                    showNotification('Error memuat ulang data pengguna: ' + error.message, 'error');
                });
        }
    }
    
    // Mobile Navigation Toggle
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuOverlay.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });
    
    // Close mobile menu when clicking overlay
    mobileMenuOverlay.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        });
    });
    
    // Back to Top Button
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Active navigation link on scroll
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === '#' + current) {
                item.classList.add('active');
            }
        });
    });
    
    // Filter materi pemrograman
    const filterBtns = document.querySelectorAll('.filter-btn');
    const materiCards = document.querySelectorAll('.materi-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            materiCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Contoh Kode Tabs
    const codeTabs = document.querySelectorAll('.code-tab');
    const codeTitle = document.getElementById('codeTitle');
    const codeContent = document.getElementById('codeContent');
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    
    // Code examples for each language
    const codeExamples = {
        html: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website PPLG Saya</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <nav>
            <div class="logo">
                <h1>PPLG Learning</h1>
            </div>
            <ul class="nav-links">
                <li><a href="#home">Beranda</a></li>
                <li><a href="#about">Tentang</a></li>
                <li><a href="#courses">Materi</a></li>
                <li><a href="#contact">Kontak</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section id="hero">
            <div class="hero-content">
                <h2>Belajar Pemrograman Web</h2>
                <p>Platform pembelajaran terbaik untuk siswa PPLG</p>
                <a href="#courses" class="btn">Mulai Belajar</a>
            </div>
        </section>
    </main>

    <script src="script.js"></script>
</body>
</html>`,
        
        css: `/* Reset default styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Poppins', sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f8f9fa;
}

/* Navigation styles */
nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 5%;
    background-color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.logo h1 {
    color: #4361ee;
    font-size: 1.8rem;
}

.nav-links {
    display: flex;
    list-style: none;
    gap: 30px;
}

.nav-links a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.3s;
}

.nav-links a:hover {
    color: #4361ee;
}

/* Hero section styles */
#hero {
    height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: linear-gradient(135deg, #4361ee, #3a0ca3);
    color: white;
    padding: 0 20px;
}

.hero-content h2 {
    font-size: 3rem;
    margin-bottom: 20px;
}

.hero-content p {
    font-size: 1.2rem;
    margin-bottom: 30px;
    max-width: 600px;
}

.btn {
    display: inline-block;
    padding: 15px 30px;
    background-color: white;
    color: #4361ee;
    text-decoration: none;
    border-radius: 50px;
    font-weight: 600;
    transition: transform 0.3s, box-shadow 0.3s;
}

.btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

/* Responsive design */
@media (max-width: 768px) {
    nav {
        flex-direction: column;
        padding: 15px;
    }
    
    .nav-links {
        margin-top: 20px;
        flex-wrap: wrap;
        justify-content: center;
    }
    
    .hero-content h2 {
        font-size: 2.2rem;
    }
}`,
        
        js: `// Navigation toggle for mobile
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.querySelector('i').classList.toggle('fa-bars');
    mobileMenuBtn.querySelector('i').classList.toggle('fa-times');
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Form validation example
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        
        if (!name || !email || !message) {
            alert('Harap isi semua field yang diperlukan!');
            return;
        }
        
        if (!validateEmail(email)) {
            alert('Email tidak valid!');
            return;
        }
        
        // Simulasi pengiriman data
        alert('Pesan berhasil dikirim! Kami akan menghubungi Anda segera.');
        contactForm.reset();
    });
}

// Email validation function
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}`,
        
        java: `import java.util.Scanner;

public class HelloWorld {
    public static void main(String[] args) {
        // Membuat objek Scanner untuk input
        Scanner scanner = new Scanner(System.in);
        
        // Menampilkan pesan selamat datang
        System.out.println("Selamat datang di PPLG Learning Hub!");
        System.out.println("=====================================");
        
        // Meminta input nama pengguna
        System.out.print("Masukkan nama Anda: ");
        String nama = scanner.nextLine();
        
        // Menampilkan pesan personalisasi
        System.out.println("Halo, " + nama + "!");
        System.out.println("Mari belajar pemrograman Java bersama.");
        
        // Contoh perhitungan sederhana
        System.out.println("\\n--- Contoh Perhitungan ---");
        System.out.print("Masukkan angka pertama: ");
        double angka1 = scanner.nextDouble();
        
        System.out.print("Masukkan angka kedua: ");
        double angka2 = scanner.nextDouble();
        
        // Melakukan operasi matematika
        double jumlah = angka1 + angka2;
        double selisih = angka1 - angka2;
        double hasilKali = angka1 * angka2;
        double hasilBagi = angka1 / angka2;
        
        // Menampilkan hasil
        System.out.println("\\nHasil perhitungan:");
        System.out.println(angka1 + " + " + angka2 + " = " + jumlah);
        System.out.println(angka1 + " - " + angka2 + " = " + selisih);
        System.out.println(angka1 + " * " + angka2 + " = " + hasilKali);
        System.out.println(angka1 + " / " + angka2 + " = " + hasilBagi);
        
        scanner.close();
        System.out.println("\\nTerima kasih telah menggunakan program ini!");
    }
}`
    };
    
    codeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            codeTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            const language = tab.getAttribute('data-language');
            codeTitle.textContent = 'example.' + language;
            codeContent.textContent = codeExamples[language];
        });
    });
    
    // Copy code functionality
    copyCodeBtn.addEventListener('click', () => {
        const codeToCopy = codeContent.textContent;
        navigator.clipboard.writeText(codeToCopy).then(() => {
            const originalText = copyCodeBtn.innerHTML;
            copyCodeBtn.innerHTML = '<i class="fas fa-check"></i><span>Kode Disalin!</span>';
            
            setTimeout(() => {
                copyCodeBtn.innerHTML = originalText;
            }, 2000);
        });
    });
    
    // Kuis Interaktif
    const quizQuestions = [
        {
            question: "Apa kepanjangan dari HTML?",
            options: [
                "HyperText Markup Language",
                "Hyper Transfer Markup Language",
                "HighText Machine Language",
                "HyperTool Markup Language"
            ],
            correct: 0
        },
        {
            question: "Fungsi utama dari CSS adalah...",
            options: [
                "Menambahkan interaktivitas ke website",
                "Mempercantik tampilan website",
                "Menyimpan data pengguna",
                "Menghubungkan ke database"
            ],
            correct: 1
        },
        {
            question: "Manakah yang BUKAN termasuk bahasa pemrograman?",
            options: [
                "Python",
                "Java",
                "Photoshop",
                "JavaScript"
            ],
            correct: 2
        },
        {
            question: "Apa fungsi dari tag <div> dalam HTML?",
            options: [
                "Membuat tabel",
                "Menampilkan gambar",
                "Membuat kontainer atau bagian halaman",
                "Membuat link"
            ],
            correct: 2
        },
        {
            question: "Bahasa pemrograman yang sering digunakan untuk membuat website dinamis adalah...",
            options: [
                "HTML",
                "CSS",
                "PHP",
                "CorelDraw"
            ],
            correct: 2
        },
        {
            question: "Manakah contoh sistem operasi?",
            options: [
                "Microsoft Word",
                "Windows",
                "Google Chrome",
                "MySQL"
            ],
            correct: 1
        },
        {
            question: "Fungsi utama dari JavaScript adalah...",
            options: [
                "Mengatur struktur halaman",
                "Mengatur tampilan halaman",
                "Menambahkan interaktivitas",
                "Menyimpan database"
            ],
            correct: 2
        },
        {
            question: "Database digunakan untuk...",
            options: [
                "Menjalankan program",
                "Menyimpan dan mengelola data",
                "Mendesain tampilan",
                "Membuat animasi"
            ],
            correct: 1
        },
        {
            question: "Perintah SQL untuk menampilkan data adalah...",
            options: [
                "INSERT",
                "UPDATE",
                "DELETE",
                "SELECT"
            ],
            correct: 3
        },
        {
            question: "Algoritma adalah...",
            options: [
                "Bahasa pemrograman",
                "Langkah-langkah logis untuk menyelesaikan masalah",
                "Aplikasi komputer",
                "Sistem operasi"
            ],
            correct: 1
        }
    ];
    
    let currentQuizQuestion = 0;
    let userScore = 0;
    const totalQuizQuestions = quizQuestions.length;
    
    const questionText = document.getElementById('questionText');
    const questionOptions = document.getElementById('questionOptions');
    const currentQuestionElement = document.getElementById('currentQuestion');
    const scoreText = document.getElementById('scoreText');
    const progressFill = document.getElementById('progressFill');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const quizContent = document.getElementById('quizContent');
    const quizResult = document.getElementById('quizResult');
    const finalScore = document.getElementById('finalScore');
    const resultMessage = document.getElementById('resultMessage');
    const retryBtn = document.getElementById('retryBtn');
    const rewardContainer = document.getElementById('rewardContainer');
    const rewardImage = document.getElementById('rewardImage');
    const rewardDescription = document.getElementById('rewardDescription');
    
    // Load question function
    function loadQuestion(index) {
        if (index < 0 || index >= quizQuestions.length) return;
        
        const question = quizQuestions[index];
        questionText.textContent = question.question;
        
        // Clear previous options
        questionOptions.innerHTML = '';
        
        // Add new options
        question.options.forEach((option, optionIndex) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.setAttribute('data-correct', optionIndex === question.correct);
            
            optionElement.innerHTML = `
                <div class="option-letter">${String.fromCharCode(65 + optionIndex)}</div>
                <div class="option-text">${option}</div>
            `;
            
            optionElement.addEventListener('click', () => {
                // Remove selected class from all options
                document.querySelectorAll('.option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Add selected class to clicked option
                optionElement.classList.add('selected');
            });
            
            questionOptions.appendChild(optionElement);
        });
        
        // Update progress
        currentQuestionElement.textContent = index + 1;
        progressFill.style.width = ((index + 1) / totalQuizQuestions) * 100 + '%';
        
        // Update navigation buttons
        prevBtn.disabled = index === 0;
        nextBtn.style.display = index === totalQuizQuestions - 1 ? 'none' : 'inline-block';
        submitBtn.style.display = index === totalQuizQuestions - 1 ? 'inline-block' : 'none';
    }
    
    // Next button functionality
    nextBtn.addEventListener('click', () => {
        // Check if an option is selected
        const selectedOption = document.querySelector('.option.selected');
        if (!selectedOption) {
            showNotification('Pilih jawaban terlebih dahulu!', 'error');
            return;
        }
        
        // Check if answer is correct
        const isCorrect = selectedOption.getAttribute('data-correct') === 'true';
        if (isCorrect) {
            userScore++;
            scoreText.textContent = 'Skor: ' + userScore;
        }
        
        // Move to next question
        currentQuizQuestion++;
        loadQuestion(currentQuizQuestion);
    });
    
    // Previous button functionality
    prevBtn.addEventListener('click', () => {
        currentQuizQuestion--;
        loadQuestion(currentQuizQuestion);
    });
    
    // Submit button functionality
    submitBtn.addEventListener('click', () => {
        // Check if an option is selected
        const selectedOption = document.querySelector('.option.selected');
        if (!selectedOption) {
            showNotification('Pilih jawaban terlebih dahulu!', 'error');
            return;
        }
        
        // Check if answer is correct
        const isCorrect = selectedOption.getAttribute('data-correct') === 'true';
        if (isCorrect) {
            userScore++;
            scoreText.textContent = 'Skor: ' + userScore;
        }
        
        // Show results
        showResults();
    });
    
    // Show quiz results function
    function showResults() {
        quizContent.style.display = 'none';
        quizResult.style.display = 'block';
        
        finalScore.textContent = userScore + '/' + totalQuizQuestions;
        
        // Set result message based on score
        let message = '';
        if (userScore === totalQuizQuestions) {
            message = 'Luar biasa! Anda menguasai semua materi pemrograman web.';
            showReward('perfect');
        } else if (userScore > 5) {
            message = 'Bagus! Anda memahami sebagian besar materi pemrograman web.';
            showReward('good');
        } else {
            message = 'Jangan menyerah! Pelajari kembali materi pemrograman web untuk meningkatkan pemahaman.';
        }
        
        resultMessage.textContent = message;
        
        // Save score to leaderboard
        saveQuizScore(userScore);
    }
    
    // Show reward based on score
    function showReward(type) {
        rewardContainer.style.display = 'block';
        
        if (type === 'perfect') {
            rewardImage.src = 'https://preview.redd.it/i1z7kignbbla1.jpg?width=640&crop=smart&auto=webp&s=b009a6a10be3fbe72c828c84b4970c6dda16ce43';
            rewardDescription.textContent = 'Anda mendapat reward istimewa karena menjawab semua pertanyaan dengan benar! Terus kembangkan pengetahuan pemrograman Anda.';
        } else if (type === 'good') {
            rewardImage.src = 'https://preview.redd.it/i1z7kignbbla1.jpg?width=640&crop=smart&auto=webp&s=b009a6a10be3fbe72c828c84b4970c6dda16ce43';
            rewardDescription.textContent = 'Anda mendapat reward karena menjawab lebih dari 5 pertanyaan dengan benar! Terus tingkatkan kemampuan pemrograman Anda.';
        }
    }
    
    // Retry quiz
    retryBtn.addEventListener('click', () => {
        currentQuizQuestion = 0;
        userScore = 0;
        
        loadQuestion(0);
        scoreText.textContent = 'Skor: ' + userScore;
        
        quizContent.style.display = 'block';
        quizResult.style.display = 'none';
        rewardContainer.style.display = 'none';
    });
    
    // Initialize quiz
    loadQuestion(0);
    
    // AUTHENTICATION SYSTEM
    // Store the target section for redirect after login
    let targetSection = null;
    
    // Auth modal elements
    const authModal = document.getElementById('loginModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModal = document.getElementById('closeModal');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authFormContainers = document.querySelectorAll('.auth-form-container');
    
    // Login form elements
    const loginForm = document.getElementById('loginForm');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const toggleLoginPassword = document.getElementById('toggleLoginPassword');
    const rememberCheckbox = document.getElementById('remember');
    
    // Register form elements
    const registerForm = document.getElementById('registerForm');
    const registerFirstName = document.getElementById('registerFirstName');
    const registerLastName = document.getElementById('registerLastName');
    const registerEmail = document.getElementById('registerEmail');
    const registerPassword = document.getElementById('registerPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const toggleRegisterPassword = document.getElementById('toggleRegisterPassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const termsCheckbox = document.getElementById('terms');
    
    // Profile modal elements
    const profileModal = document.getElementById('profileModal');
    const profileModalOverlay = document.getElementById('profileModalOverlay');
    const closeProfileModal = document.getElementById('closeProfileModal');
    const profileTabs = document.querySelectorAll('.profile-tab');
    const profileTabPanes = document.querySelectorAll('.profile-tab-pane');
    
    // Profile form elements
    const profileForm = document.getElementById('profileForm');
    const profileFirstName = document.getElementById('profileFirstName');
    const profileLastName = document.getElementById('profileLastName');
    const profileEmailInput = document.getElementById('profileEmailInput');
    const profileBio = document.getElementById('profileBio');
    
    // Password change form elements
    const passwordChangeForm = document.getElementById('passwordChangeForm');
    const currentPassword = document.getElementById('currentPassword');
    const newPassword = document.getElementById('newPassword');
    const confirmNewPassword = document.getElementById('confirmNewPassword');
    const toggleCurrentPassword = document.getElementById('toggleCurrentPassword');
    const toggleNewPassword = document.getElementById('toggleNewPassword');
    const toggleConfirmNewPasswordBtn = document.getElementById('toggleConfirmNewPassword');
    
    // Show auth modal function
    function showAuthModal(tab = 'login', sectionId = null) {
        if (!authModal) return;
        
        authModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scroll
        
        // Store the target section for redirect after login
        targetSection = sectionId;
        
        // Switch to the specified tab
        switchAuthTab(tab);
    }
    
    // Hide auth modal function
    function hideAuthModal() {
        if (!authModal) return;
        
        authModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Enable background scroll
        
        // Clear forms
        if (loginForm) loginForm.reset();
        if (registerForm) registerForm.reset();
        
        // Remove any messages
        removeMessages();
    }
    
    // Switch auth tab function
    function switchAuthTab(tabName) {
        // Remove active class from all tabs and containers
        authTabs.forEach(tab => tab.classList.remove('active'));
        authFormContainers.forEach(container => container.classList.remove('active'));
        
        // Add active class to selected tab and container
        const selectedTab = document.querySelector(`.auth-tab[data-tab="${tabName}"]`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        const selectedContainer = document.getElementById(`${tabName}FormContainer`);
        if (selectedContainer) {
            selectedContainer.classList.add('active');
        }
    }
    
    // Toggle password visibility
    function setupPasswordToggle(toggleBtn, inputField) {
        if (!toggleBtn || !inputField) return;
        
        toggleBtn.addEventListener('click', function() {
            const type = inputField.getAttribute('type') === 'password' ? 'text' : 'password';
            inputField.setAttribute('type', type);
            
            // Change icon
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    }
    
    // Setup password toggles
    setupPasswordToggle(toggleLoginPassword, loginPassword);
    setupPasswordToggle(toggleRegisterPassword, registerPassword);
    setupPasswordToggle(toggleConfirmPassword, confirmPassword);
    setupPasswordToggle(toggleCurrentPassword, currentPassword);
    setupPasswordToggle(toggleNewPassword, newPassword);
    setupPasswordToggle(toggleConfirmNewPasswordBtn, confirmNewPassword);
    
    // Auth tab clicks
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchAuthTab(tabName);
        });
    });
    
    // Close modal when clicking close button or overlay
    if (closeModal) {
        closeModal.addEventListener('click', hideAuthModal);
    }
    if (modalOverlay) {
        modalOverlay.addEventListener('click', hideAuthModal);
    }
    
    // Password strength checker
    if (registerPassword) {
        registerPassword.addEventListener('input', function() {
            const password = this.value;
            const strengthContainer = document.getElementById('passwordStrength');
            const strengthValue = document.getElementById('strengthValue');
            
            if (!strengthContainer || !strengthValue) return;
            
            // Remove all strength classes
            strengthContainer.classList.remove('strength-weak', 'strength-medium', 'strength-strong');
            
            if (password.length === 0) {
                strengthValue.textContent = '-';
                return;
            }
            
            // Check password strength
            let strength = 0;
            
            // Length check
            if (password.length >= 8) strength++;
            if (password.length >= 12) strength++;
            
            // Character variety checks
            if (/[a-z]/.test(password)) strength++; // lowercase
            if (/[A-Z]/.test(password)) strength++; // uppercase
            if (/[0-9]/.test(password)) strength++; // numbers
            if (/[^a-zA-Z0-9]/.test(password)) strength++; // special characters
            
            // Update UI based on strength
            if (strength <= 2) {
                strengthContainer.classList.add('strength-weak');
                strengthValue.textContent = 'Lemah';
            } else if (strength <= 4) {
                strengthContainer.classList.add('strength-medium');
                strengthValue.textContent = 'Sedang';
            } else {
                strengthContainer.classList.add('strength-strong');
                strengthValue.textContent = 'Kuat';
            }
        });
    }
    
    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = loginEmail.value;
            const password = loginPassword.value;
            const remember = rememberCheckbox.checked;
            
            // Sign in with Firebase
            if (window.signInWithEmailAndPassword) {
                window.signInWithEmailAndPassword(window.auth, email, password)
                    .then((userCredential) => {
                        // Signed in successfully
                        const user = userCredential.user;
                        
                        // Send email verification if not verified
                        if (!user.emailVerified) {
                            window.sendEmailVerification(user)
                                .then(() => {
                                    // Hide modal
                                    hideAuthModal();
                                    
                                    // Show verification modal
                                    showVerificationModal(user.email);
                                    
                                    // Show notification
                                    showNotification('Email verifikasi telah dikirim! Silakan periksa email Anda.', 'success');
                                })
                                .catch((error) => {
                                    showNotification('Error mengirim email verifikasi: ' + error.message, 'error');
                                });
                        } else {
                            // Email already verified, continue with normal login
                            // Update persistence based on remember checkbox
                            if (remember) {
                                window.auth.setPersistence('local');
                            } else {
                                window.auth.setPersistence('session');
                            }
                            
                            // Hide modal
                            hideAuthModal();
                            
                            // Show success message
                            showNotification('Login berhasil! Selamat datang kembali.', 'success');
                            
                            // Redirect to target section if specified
                            if (targetSection) {
                                const targetElement = document.getElementById(targetSection);
                                if (targetElement) {
                                    setTimeout(() => {
                                        window.scrollTo({
                                            top: targetElement.offsetTop - 80,
                                            behavior: 'smooth'
                                        });
                                    }, 100);
                                }
                                targetSection = null; // Clear target section
                            }
                        }
                        
                        // Update UI for logged in user
                        updateUIForLoggedInUser(user);
                    })
                    .catch((error) => {
                        // Handle errors
                        let errorMessage = 'Terjadi kesalahan saat login. Silakan coba lagi.';
                        
                        switch (error.code) {
                            case 'auth/user-not-found':
                                errorMessage = 'Pengguna dengan email ini tidak ditemukan.';
                                break;
                            case 'auth/wrong-password':
                                errorMessage = 'Password salah. Silakan coba lagi.';
                                break;
                            case 'auth/too-many-requests':
                                errorMessage = 'Terlalu banyak percobaan login. Silakan coba lagi nanti.';
                                break;
                            case 'auth/user-disabled':
                                errorMessage = 'Akun Anda telah dinonaktifkan.';
                                break;
                        }
                        
                        showNotification(errorMessage, 'error');
                    });
            }
        });
    }
    
    // Handle register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const firstName = registerFirstName.value;
            const lastName = registerLastName.value;
            const email = registerEmail.value;
            const password = registerPassword.value;
            const passwordConfirm = confirmPassword.value;
            const termsAccepted = termsCheckbox.checked;
            
            // Validate form
            if (password !== passwordConfirm) {
                showNotification('Password tidak cocok!', 'error');
                return;
            }
            
            if (!termsAccepted) {
                showNotification('Anda harus menyetujui syarat dan ketentuan!', 'error');
                return;
            }
            
            // Check password strength
            const strengthContainer = document.getElementById('passwordStrength');
            if (strengthContainer && strengthContainer.classList.contains('strength-weak')) {
                showNotification('Password terlalu lemah. Gunakan kombinasi huruf besar, kecil, angka, dan simbol.', 'error');
                return;
            }
            
            // Create user with Firebase
            if (window.createUserWithEmailAndPassword) {
                window.createUserWithEmailAndPassword(window.auth, email, password)
                    .then((userCredential) => {
                        // Signed up successfully
                        const user = userCredential.user;
                        
                        // Update user profile
                        return window.updateProfile(user, {
                            displayName: `${firstName} ${lastName}`
                        }).then(() => {
                            // Create user document in Firestore
                            if (window.doc && window.setDoc && window.serverTimestamp) {
                                return window.setDoc(window.doc(window.db, 'users', user.uid), {
                                    firstName: firstName,
                                    lastName: lastName,
                                    email: email,
                                    displayName: `${firstName} ${lastName}`,
                                    photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/150/150.jpg`,
                                    createdAt: window.serverTimestamp(),
                                    lastLogin: window.serverTimestamp(),
                                    coursesCompleted: [],
                                    quizScores: [],
                                    studyHours: 0,
                                    bio: ''
                                });
                            }
                        });
                    })
                    .then(() => {
                        // Send email verification
                        return window.sendEmailVerification(user)
                            .then(() => {
                                // Hide modal
                                hideAuthModal();
                                
                                // Show verification modal
                                showVerificationModal(user.email);
                                
                                // Show notification
                                showNotification('Registrasi berhasil! Email verifikasi telah dikirim.', 'success');
                            })
                            .catch((error) => {
                                // Handle error sending verification email
                                showNotification('Error mengirim email verifikasi: ' + error.message, 'error');
                            });
                    })
                    .catch((error) => {
                        // Handle errors
                        let errorMessage = 'Terjadi kesalahan saat registrasi. Silakan coba lagi.';
                        
                        switch (error.code) {
                            case 'auth/email-already-in-use':
                                errorMessage = 'Email ini sudah digunakan. Silakan gunakan email lain atau login.';
                                break;
                            case 'auth/weak-password':
                                errorMessage = 'Password terlalu lemah. Gunakan minimal 6 karakter.';
                                break;
                            case 'auth/invalid-email':
                                errorMessage = 'Format email tidak valid.';
                                break;
                        }
                        
                        showNotification(errorMessage, 'error');
                    });
            }
        });
    }
    
    // Update UI for logged in user
    function updateUIForLoggedInUser(user) {
        document.body.classList.add('logged-in');
        
        // Add user info to header if not already exists
        const navbar = document.querySelector('.navbar');
        if (navbar && !navbar.querySelector('.user-info')) {
            // Remove existing login button
            const existingLoginBtn = navbar.querySelector('.login-btn');
            if (existingLoginBtn) {
                existingLoginBtn.remove();
            }
            
            // Create user info element
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            
            // Get user initials for avatar
            const initials = getUserInitials(user.displayName || user.email);
            
            userInfo.innerHTML = `
                <div class="user-avatar" id="headerUserAvatar" title="Lihat Profil">
                    ${user.photoURL ? `<img src="${user.photoURL}" alt="${user.displayName}">` : initials}
                </div>
                <div class="user-details">
                    <div class="user-name">${user.displayName || user.email}</div>
                    <a href="#" id="logoutBtn" class="logout-link">Logout</a>
                </div>
            `;
            
            // Add user info to navbar
            navbar.appendChild(userInfo);
            
            // Add logout functionality
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Sign out with Firebase
                    if (window.signOut) {
                        window.signOut(window.auth)
                            .then(() => {
                                // Show success message
                                showNotification('Anda telah logout.', 'success');
                                
                                // Reload page to update UI
                                window.location.reload();
                            })
                            .catch((error) => {
                                // Handle errors
                                showNotification('Error saat logout: ' + error.message, 'error');
                            });
                    }
                });
            }
            
            // Add click event to user avatar to show profile modal
            const headerUserAvatar = document.getElementById('headerUserAvatar');
            if (headerUserAvatar) {
                headerUserAvatar.addEventListener('click', () => {
                    showProfileModal();
                });
            }
        }
        
        // Add click event to materi cards
        document.querySelectorAll('.materi-card').forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', function() {
                const materiKey = this.getAttribute('data-materi');
                if (materiKey) {
                    showMateriModal(materiKey);
                }
            });
        });
    }
    
    // Update UI for logged out user
    function updateUIForLoggedOutUser() {
        document.body.classList.remove('logged-in');
        
        // Add login button if not already exists
        const navbar = document.querySelector('.navbar');
        if (navbar && !navbar.querySelector('.login-btn')) {
            // Remove existing user info
            const existingUserInfo = navbar.querySelector('.user-info');
            if (existingUserInfo) {
                existingUserInfo.remove();
            }
            
            const loginButton = document.createElement('button');
            loginButton.className = 'btn btn-primary login-btn';
            loginButton.textContent = 'Login';
            loginButton.onclick = () => showAuthModal('login');
            
            navbar.appendChild(loginButton);
        }
    }
    
    // Load user profile from Firestore
    function loadUserProfile(user) {
        if (!user) return;
        
        if (window.getDoc && window.updateDoc && window.db) {
            window.getDoc(window.doc(window.db, 'users', user.uid))
                .then((doc) => {
                    if (doc.exists()) {
                        const userData = doc.data();
                        
                        // Update profile modal with user data
                        if (profileFirstName) profileFirstName.value = userData.firstName || '';
                        if (profileLastName) profileLastName.value = userData.lastName || '';
                        if (profileEmailInput) profileEmailInput.value = userData.email || '';
                        if (profileBio) profileBio.value = userData.bio || '';
                        
                        // Update profile stats
                        if (document.getElementById('profileCoursesCompleted')) {
                            document.getElementById('profileCoursesCompleted').textContent = userData.coursesCompleted ? userData.coursesCompleted.length : 0;
                        }
                        
                        if (document.getElementById('profileStudyHours')) {
                            document.getElementById('profileStudyHours').textContent = userData.studyHours || 0;
                        }
                        
                        // Get highest quiz score
                        if (userData.quizScores && userData.quizScores.length > 0) {
                            const highestScore = Math.max(...userData.quizScores.map(score => score.score));
                            if (document.getElementById('profileQuizScore')) {
                                document.getElementById('profileQuizScore').textContent = highestScore;
                            }
                        }
                        
                        // Load user progress
                        loadUserProgress(userData);
                        
                        // Load user achievements
                        loadUserAchievements(userData);
                    } else {
                        console.log("No such document!");
                    }
                })
                .catch((error) => {
                    console.log("Error getting document:", error);
                });
        }
    }
    
    // Load user progress
    function loadUserProgress(userData) {
        const courseProgressList = document.getElementById('courseProgressList');
        if (!courseProgressList) return;
        
        // Clear existing progress
        courseProgressList.innerHTML = '';
        
        // Get all courses
        const courses = ['html', 'css', 'javascript', 'java', 'python'];
        
        courses.forEach(courseKey => {
            const course = materiData[courseKey];
            if (!course) return;
            
            // Check if user has completed this course
            const isCompleted = userData.coursesCompleted && userData.coursesCompleted.includes(courseKey);
            const progress = isCompleted ? 100 : Math.floor(Math.random() * 80); // Random progress for demo
            
            const progressItem = document.createElement('div');
            progressItem.className = 'course-progress-item';
            progressItem.innerHTML = `
                <h5 class="course-progress-title">${course.title}</h5>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${progress}%"></div>
                </div>
                <p>${progress}% Selesai</p>
            `;
            
            courseProgressList.appendChild(progressItem);
        });
    }
    
    // Load user achievements
    function loadUserAchievements(userData) {
        const achievementsList = document.getElementById('achievementsList');
        if (!achievementsList) return;
        
        // Clear existing achievements
        achievementsList.innerHTML = '';
        
        // Define achievements
        const achievements = [
            { id: 'first_login', title: 'Pengguna Baru', icon: 'fa-user-plus', description: 'Login untuk pertama kali' },
            { id: 'first_course', title: 'Pembelajar Pertama', icon: 'fa-graduation-cap', description: 'Menyelesaikan kursus pertama' },
            { id: 'quiz_master', title: 'Master Kuis', icon: 'fa-trophy', description: 'Mendapat skor sempurna di kuis' },
            { id: 'dedicated_learner', title: 'Pembelajar Dedikasi', icon: 'fa-clock', description: 'Belajar lebih dari 10 jam' },
            { id: 'full_stack', title: 'Full Stack Developer', icon: 'fa-code', description: 'Menyelesaikan semua kursus' }
        ];
        
        // Check which achievements the user has unlocked
        const unlockedAchievements = userData.achievements || [];
        
        achievements.forEach(achievement => {
            const isUnlocked = unlockedAchievements.includes(achievement.id);
            
            const achievementItem = document.createElement('div');
            achievementItem.className = 'achievement-item';
            achievementItem.innerHTML = `
                <div class="achievement-icon">
                    <i class="fas ${achievement.icon}" style="color: ${isUnlocked ? 'var(--primary)' : '#ccc'}"></i>
                </div>
                <h5 class="achievement-title" style="color: ${isUnlocked ? 'var(--dark)' : '#999'}">${achievement.title}</h5>
                <p>${achievement.description}</p>
            `;
            
            achievementsList.appendChild(achievementItem);
        });
    }
    
    // Show profile modal
    function showProfileModal() {
        if (!profileModal) return;
        
        profileModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scroll
        
        // Load current user data
        if (window.auth) {
            const user = window.auth.currentUser;
            if (user) {
                loadUserProfile(user);
                
                // Update profile header
                const profileName = document.getElementById('profileName');
                const profileEmail = document.getElementById('profileEmail');
                const profileAvatar = document.getElementById('profileAvatar');
                
                if (profileName) profileName.textContent = user.displayName || 'Pengguna';
                if (profileEmail) profileEmail.textContent = user.email;
                if (profileAvatar && user.photoURL) profileAvatar.src = user.photoURL;
            }
        }
    }
    
    // Hide profile modal
    function hideProfileModal() {
        if (!profileModal) return;
        
        profileModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Enable background scroll
    }
    
    // Profile tab clicks
    profileTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and panes
            profileTabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.profile-tab-pane').forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Show corresponding pane
            const tabId = tab.getAttribute('data-tab');
            const tabPane = document.getElementById(tabId);
            if (tabPane) {
                tabPane.classList.add('active');
            }
        });
    });
    
    // Close profile modal when clicking close button or overlay
    if (closeProfileModal) {
        closeProfileModal.addEventListener('click', hideProfileModal);
    }
    if (profileModalOverlay) {
        profileModalOverlay.addEventListener('click', hideProfileModal);
    }
    
    // Handle profile form submission
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const user = window.auth.currentUser;
            if (!user) return;
            
            const firstName = profileFirstName.value;
            const lastName = profileLastName.value;
            const bio = profileBio.value;
            
            // Update user profile in Firebase Auth
            if (window.updateProfile) {
                window.updateProfile(user, {
                    displayName: `${firstName} ${lastName}`
                })
                .then(() => {
                    // Update user document in Firestore
                    if (window.updateDoc && window.db) {
                        return window.updateDoc(window.doc(window.db, 'users', user.uid), {
                            firstName: firstName,
                            lastName: lastName,
                            bio: bio
                        });
                    }
                })
                .then(() => {
                    // Show success message
                    showNotification('Profil berhasil diperbarui!', 'success');
                    
                    // Update UI
                    const userNameElement = document.querySelector('.user-name');
                    if (userNameElement) {
                        userNameElement.textContent = `${firstName} ${lastName}`;
                    }
                })
                .catch((error) => {
                    // Handle errors
                    showNotification('Error memperbarui profil: ' + error.message, 'error');
                });
            }
        });
    }
    
    // Handle password change form submission
    if (passwordChangeForm) {
        passwordChangeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const user = window.auth.currentUser;
            if (!user) return;
            
            const currentPass = currentPassword.value;
            const newPass = newPassword.value;
            const confirmNewPass = confirmNewPassword.value;
            
            // Validate form
            if (newPass !== confirmNewPass) {
                showNotification('Password baru tidak cocok!', 'error');
                return;
            }
            
            // Reauthenticate user
            if (window.EmailAuthProvider && window.reauthenticateWithCredential) {
                const credential = window.EmailAuthProvider.credential(
                    user.email,
                    currentPass
                );
                
                user.reauthenticateWithCredential(credential)
                    .then(() => {
                        // Update password
                        return user.updatePassword(newPass);
                    })
                    .then(() => {
                        // Show success message
                        showNotification('Password berhasil diubah!', 'success');
                        
                        // Reset form
                        passwordChangeForm.reset();
                    })
                    .catch((error) => {
                        // Handle errors
                        let errorMessage = 'Error mengubah password.';
                        
                        switch (error.code) {
                            case 'auth/wrong-password':
                                errorMessage = 'Password saat ini salah.';
                                break;
                            case 'auth/weak-password':
                                errorMessage = 'Password baru terlalu lemah. Gunakan minimal 6 karakter.';
                                break;
                        }
                        
                        showNotification(errorMessage, 'error');
                    });
            }
        });
    }
    
    // Materi Detail Modal
    const materiModal = document.getElementById('materiModal');
    const materiModalOverlay = document.getElementById('materiModalOverlay');
    const closeMateriModal = document.getElementById('closeMateriModal');
    const materiModalTitle = document.getElementById('materiModalTitle');
    const materiDescription = document.getElementById('materiDescription');
    const materiDuration = document.getElementById('materiDuration');
    const materiModules = document.getElementById('materiModules');
    const materiLevel = document.getElementById('materiLevel');
    const materiVideoContainer = document.getElementById('materiVideoContainer');
    const modulesList = document.getElementById('modulesList');
    const resourcesList = document.getElementById('resourcesList');
    
    // Data materi lengkap
    const materiData = {
        html: {
            title: "HTML 5",
            description: "HTML5 adalah versi terbaru dari HTML yang membawa banyak elemen dan atribut baru yang memungkinkan pembuatan website yang lebih semantik dan interaktif. Dalam kursus ini, Anda akan mempelajari struktur dasar HTML, elemen semantik, formulir, media, dan API baru yang tersedia di HTML5.",
            duration: "15 Jam",
            modules: "12 Modul",
            level: "Pemula",
            videoId: "UB1O30fR-EE",
            modulesList: [
                {
                    number: 1,
                    title: "Pengenalan HTML5",
                    duration: "45 menit",
                    description: "Memahami sejarah, perbedaan dengan versi sebelumnya, dan fitur-fitur utama HTML5."
                },
                {
                    number: 2,
                    title: "Struktur Dokumen HTML5",
                    duration: "60 menit",
                    description: "Mempelajari struktur dasar dokumen HTML5 dan doctype yang benar."
                },
                {
                    number: 3,
                    title: "Elemen Semantik",
                    duration: "75 menit",
                    description: "Menggunakan elemen semantik seperti header, nav, section, article, dan footer."
                },
                {
                    number: 4,
                    title: "Formulir HTML5",
                    duration: "90 menit",
                    description: "Membuat formulir dengan input types baru dan validasi HTML5."
                },
                {
                    number: 5,
                    title: "Media Elements",
                    duration: "60 menit",
                    description: "Menggunakan audio dan video elements untuk konten multimedia."
                },
                {
                    number: 6,
                    title: "Canvas API",
                    duration: "120 menit",
                    description: "Menggambar grafis dengan Canvas API untuk game dan visualisasi data."
                },
                {
                    number: 7,
                    title: "Local Storage",
                    duration: "45 menit",
                    description: "Menyimpan data di browser dengan Local Storage dan Session Storage."
                },
                {
                    number: 8,
                    title: "Geolocation API",
                    duration: "60 menit",
                    description: "Mendapatkan lokasi pengguna dengan Geolocation API."
                },
                {
                    number: 9,
                    title: "Drag and Drop",
                    duration: "75 menit",
                    description: "Mengimplementasikan drag and drop dengan HTML5 Drag and Drop API."
                },
                {
                    number: 10,
                    title: "Web Workers",
                    duration: "90 menit",
                    description: "Menjalankan JavaScript di background dengan Web Workers."
                },
                {
                    number: 11,
                    title: "WebSockets",
                    duration: "90 menit",
                    description: "Komunikasi real-time dengan WebSockets."
                },
                {
                    number: 12,
                    title: "Proyek Akhir",
                    duration: "120 menit",
                    description: "Membangun website responsif dengan HTML5."
                }
            ],
            resources: [
                {
                    icon: "fas fa-book",
                    title: "Dokumentasi HTML5",
                    description: "Dokumentasi resmi dari MDN Web Docs"
                },
                {
                    icon: "fas fa-code",
                    title: "Codepen Examples",
                    description: "Koleksi contoh kode HTML5"
                },
                {
                    icon: "fas fa-download",
                    title: "Template HTML5",
                    description: "Template website responsif dengan HTML5"
                },
                {
                    icon: "fas fa-video",
                    title: "Video Tutorial Tambahan",
                    description: "Video tutorial dari expert HTML5"
                }
            ]
        },
        css: {
            title: "CSS 3 & Flexbox",
            description: "CSS3 membawa banyak fitur baru seperti animasi, transisi, transformasi, dan layout modern seperti Flexbox dan Grid. Dalam kursus ini, Anda akan mempelajari cara menggunakan fitur-fitur ini untuk menciptakan tampilan website yang menarik.",
            duration: "20 Jam",
            modules: "18 Modul",
            level: "Menengah",
            videoId: "1Rs2ND1ryYc",
            modulesList: [
                {
                    number: 1,
                    title: "Pengenalan CSS3",
                    duration: "45 menit",
                    description: "Memahami fitur-fitur baru di CSS3 dan cara menggunakannya."
                },
                {
                    number: 2,
                    title: "Selectors Lanjutan",
                    duration: "60 menit",
                    description: "Menggunakan selectors seperti :not, :nth-child, dan attribute selectors."
                },
                {
                    number: 3,
                    title: "Transisi dan Animasi",
                    duration: "90 menit",
                    description: "Membuat animasi dan transisi yang halus dengan CSS3."
                },
                {
                    number: 4,
                    title: "Transformasi 2D dan 3D",
                    duration: "75 menit",
                    description: "Menggunakan transform untuk memanipulasi elemen dalam 2D dan 3D."
                },
                {
                    number: 5,
                    title: "Flexbox Layout",
                    duration: "120 menit",
                    description: "Membuat layout yang fleksibel dengan Flexbox."
                },
                {
                    number: 6,
                    title: "Grid Layout",
                    duration: "120 menit",
                    description: "Membuat layout yang kompleks dengan CSS Grid."
                },
                {
                    number: 7,
                    title: "Responsive Design",
                    duration: "90 menit",
                    description: "Membuat website yang responsif dengan media queries."
                },
                {
                    number: 8,
                    title: "Custom Properties",
                    duration: "60 menit",
                    description: "Menggunakan CSS Variables untuk membuat kode yang lebih maintainable."
                },
                {
                    number: 9,
                    title: "Filter dan Blend Modes",
                    duration: "75 menit",
                    description: "Menerapkan filter dan blend modes untuk efek visual."
                },
                {
                    number: 10,
                    title: "Clipping dan Masking",
                    duration: "60 menit",
                    description: "Menggunakan clip-path dan mask untuk bentuk yang kreatif."
                },
                {
                    number: 11,
                    title: "Column Layout",
                    duration: "45 menit",
                    description: "Membuat layout multi-kolom seperti di koran."
                },
                {
                    number: 12,
                    title: "CSS Shapes",
                    duration: "60 menit",
                    description: "Membuat teks mengalir di sekitar bentuk yang kompleks."
                },
                {
                    number: 13,
                    title: "Scroll Snap",
                    duration: "45 menit",
                    description: "Mengontrol scroll behavior dengan scroll snap."
                },
                {
                    number: 14,
                    title: "Container Queries",
                    duration: "60 menit",
                    description: "Membuat komponen yang responsif berdasarkan container."
                },
                {
                    number: 15,
                    title: "CSS Houdini",
                    duration: "90 menit",
                    description: "Menggunakan API CSS Houdini untuk fitur CSS yang lebih canggih."
                },
                {
                    number: 16,
                    title: "Performance Optimization",
                    duration: "75 menit",
                    description: "Mengoptimalkan performa rendering CSS."
                },
                {
                    number: 17,
                    title: "CSS-in-JS",
                    duration: "60 menit",
                    description: "Menulis CSS dalam JavaScript dengan Styled Components dan Emotion."
                },
                {
                    number: 18,
                    title: "Proyek Akhir",
                    duration: "120 menit",
                    description: "Membangun website dengan layout modern dan animasi."
                }
            ],
            resources: [
                {
                    icon: "fas fa-book",
                    title: "Dokumentasi CSS3",
                    description: "Dokumentasi resmi dari MDN Web Docs"
                },
                {
                    icon: "fas fa-code",
                    title: "Flexbox Froggy",
                    description: "Game interaktif untuk belajar Flexbox"
                },
                {
                    icon: "fas fa-puzzle-piece",
                    title: "CSS Grid Garden",
                    description: "Game interaktif untuk belajar CSS Grid"
                },
                {
                    icon: "fas fa-download",
                    title: "CSS Frameworks",
                    description: "Koleksi CSS framework modern"
                }
            ]
        },
        javascript: {
            title: "JavaScript ES6+",
            description: "JavaScript ES6+ membawa banyak fitur baru seperti arrow functions, classes, destructuring, modules, dan banyak lagi. Dalam kursus ini, Anda akan mempelajari fitur-fitur modern JavaScript dan cara menggunakannya untuk membuat aplikasi web yang interaktif.",
            duration: "30 Jam",
            modules: "24 Modul",
            level: "Menengah",
            videoId: "W6NZfCO5SIk",
            modulesList: [
                {
                    number: 1,
                    title: "Pengenalan ES6+",
                    duration: "60 menit",
                    description: "Memahami sejarah dan fitur-fitur utama di ES6+."
                },
                {
                    number: 2,
                    title: "Let dan Const",
                    duration: "45 menit",
                    description: "Menggunakan let dan const untuk variabel dengan block scope."
                },
                {
                    number: 3,
                    title: "Arrow Functions",
                    duration: "60 menit",
                    description: "Menulis fungsi dengan syntax yang lebih singkat."
                },
                {
                    number: 4,
                    title: "Template Literals",
                    duration: "45 menit",
                    description: "Membuat string dengan template literals."
                },
                {
                    number: 5,
                    title: "Destructuring",
                    duration: "75 menit",
                    description: "Mengekstrak nilai dari array dan object dengan destructuring."
                },
                {
                    number: 6,
                    title: "Default Parameters",
                    duration: "30 menit",
                    description: "Memberikan nilai default pada parameter fungsi."
                },
                {
                    number: 7,
                    title: "Rest dan Spread Operators",
                    duration: "60 menit",
                    description: "Menggunakan rest dan spread operators."
                },
                {
                    number: 8,
                    title: "Classes",
                    duration: "90 menit",
                    description: "Membuat class dan inheritance dengan JavaScript."
                },
                {
                    number: 9,
                    title: "Modules",
                    duration: "75 menit",
                    description: "Mengorganisir kode dengan ES6 modules."
                },
                {
                    number: 10,
                    title: "Promises",
                    duration: "90 menit",
                    description: "Menangani asynchronous operations dengan Promises."
                },
                {
                    number: 11,
                    title: "Async/Await",
                    duration: "75 menit",
                    description: "Menulis asynchronous code yang lebih readable dengan async/await."
                },
                {
                    number: 12,
                    title: "Fetch API",
                    duration: "60 menit",
                    description: "Mengambil data dari server dengan Fetch API."
                },
                {
                    number: 13,
                    title: "Maps dan Sets",
                    duration: "45 menit",
                    description: "Menggunakan data structures Maps dan Sets."
                },
                {
                    number: 14,
                    title: "Iterators dan Generators",
                    duration: "75 menit",
                    description: "Membuat custom iterators dan generators."
                },
                {
                    number: 15,
                    title: "Symbols",
                    duration: "45 menit",
                    description: "Menggunakan Symbols untuk property keys yang unik."
                },
                {
                    number: 16,
                    title: "Proxies",
                    duration: "60 menit",
                    description: "Menggunakan Proxies untuk metaprogramming."
                },
                {
                    number: 17,
                    title: "Reflect API",
                    duration: "45 menit",
                    description: "Menggunakan Reflect API untuk operasi object."
                },
                {
                    number: 18,
                    title: "Array Methods Lanjutan",
                    duration: "75 menit",
                    description: "Menggunakan array methods seperti map, filter, dan reduce."
                },
                {
                    number: 19,
                    title: "Object Methods Lanjutan",
                    duration: "60 menit",
                    description: "Menggunakan object methods seperti Object.assign dan Object.keys."
                },
                {
                    number: 20,
                    title: "String Methods Lanjutan",
                    duration: "45 menit",
                    description: "Menggunakan string methods baru di ES6+."
                },
                {
                    number: 21,
                    title: "Number Methods Lanjutan",
                    duration: "45 menit",
                    description: "Menggunakan number methods baru di ES6+."
                },
                {
                    number: 22,
                    title: "Web Workers",
                    duration: "75 menit",
                    description: "Menjalankan JavaScript di background thread."
                },
                {
                    number: 23,
                    title: "Service Workers",
                    duration: "90 menit",
                    description: "Membuat Progressive Web Apps dengan Service Workers."
                },
                {
                    number: 24,
                    title: "Proyek Akhir",
                    duration: "120 menit",
                    description: "Membangun aplikasi web dengan ES6+."
                }
            ],
            resources: [
                {
                    icon: "fas fa-book",
                    title: "Dokumentasi JavaScript",
                    description: "Dokumentasi resmi dari MDN Web Docs"
                },
                {
                    icon: "fas fa-code",
                    title: "JavaScript.info",
                    description: "Tutorial modern JavaScript"
                },
                {
                    icon: "fas fa-puzzle-piece",
                    title: "JavaScript30",
                    description: "30 hari JavaScript challenge"
                },
                {
                    icon: "fas fa-download",
                    title: "ES6 Cheatsheet",
                    description: "Cheat sheet untuk fitur ES6+"
                }
            ]
        },
        java: {
            title: "Java Programming",
            description: "Java adalah bahasa pemrograman yang populer untuk pengembangan aplikasi enterprise, Android, dan sistem backend. Dalam kursus ini, Anda akan mempelajari dasar-dasar pemrograman Java, konsep OOP, collection framework, dan pengembangan aplikasi desktop.",
            duration: "25 Jam",
            modules: "20 Modul",
            level: "Pemula",
            videoId: "eIrMbAQSU34",
            modulesList: [
                {
                    number: 1,
                    title: "Pengenalan Java",
                    duration: "60 menit",
                    description: "Memahami sejarah Java, fitur-fitur utama Java, dan instalasi JDK."
                },
                {
                    number: 2,
                    title: "Syntax Dasar Java",
                    duration: "75 menit",
                    description: "Mempelajari syntax dasar Java, tipe data, dan variabel."
                },
                {
                    number: 3,
                    title: "Operator di Java",
                    duration: "60 menit",
                    description: "Menggunakan operator aritmatika, perbandingan, dan logika."
                },
                {
                    number: 4,
                    title: "Control Flow",
                    duration: "90 menit",
                    description: "Menggunakan if-else, switch, for, while, dan do-while."
                },
                {
                    number: 5,
                    title: "Array",
                    duration: "75 menit",
                    description: "Menggunakan array satu dimensi dan multidimensi."
                },
                {
                    number: 6,
                    title: "Methods",
                    duration: "60 menit",
                    description: "Membuat dan menggunakan methods."
                },
                {
                    number: 7,
                    title: "OOP - Encapsulation",
                    duration: "90 menit",
                    description: "Memahami konsep encapsulation dengan access modifiers."
                },
                {
                    number: 8,
                    title: "OOP - Inheritance",
                    duration: "90 menit",
                    description: "Menggunakan inheritance untuk code reuse."
                },
                {
                    number: 9,
                    title: "OOP - Polymorphism",
                    duration: "75 menit",
                    description: "Memahami konsep polymorphism dengan method overriding."
                },
                {
                    number: 10,
                    title: "OOP - Abstraction",
                    duration: "60 menit",
                    description: "Menggunakan abstract classes dan interfaces."
                },
                {
                    number: 11,
                    title: "Exception Handling",
                    duration: "75 menit",
                    description: "Menangani error dengan try-catch-finally."
                },
                {
                    number: 12,
                    title: "String Handling",
                    duration: "60 menit",
                    description: "Memanipulasi string dengan String class."
                },
                {
                    number: 13,
                    title: "Collection Framework - List",
                    duration: "90 menit",
                    description: "Menggunakan ArrayList dan LinkedList."
                },
                {
                    number: 14,
                    title: "Collection Framework - Set",
                    duration: "75 menit",
                    description: "Menggunakan HashSet dan TreeSet."
                },
                {
                    number: 15,
                    title: "Collection Framework - Map",
                    duration: "90 menit",
                    description: "Menggunakan HashMap dan TreeMap."
                },
                {
                    number: 16,
                    title: "Generics",
                    duration: "60 menit",
                    description: "Menggunakan generics untuk type safety."
                },
                {
                    number: 17,
                    title: "File I/O",
                    duration: "75 menit",
                    description: "Membaca dan menulis file dengan Java I/O."
                },
                {
                    number: 18,
                    title: "Multithreading",
                    duration: "90 menit",
                    description: "Membuat aplikasi multithreaded."
                },
                {
                    number: 19,
                    title: "Lambda Expressions",
                    duration: "60 menit",
                    description: "Menggunakan lambda expressions untuk functional programming."
                },
                {
                    number: 20,
                    title: "Proyek Akhir",
                    duration: "120 menit",
                    description: "Membangun web application dengan Java."
                }
            ],
            resources: [
                {
                    icon: "fas fa-book",
                    title: "Dokumentasi Java",
                    description: "Dokumentasi resmi dari Oracle"
                },
                {
                    icon: "fas fa-code",
                    title: "Java Code Examples",
                    description: "Koleksi contoh kode Java"
                },
                {
                    icon: "fas fa-download",
                    title: "Java Development Kit",
                    description: "Link download JDK terbaru"
                },
                {
                    icon: "fas fa-video",
                    title: "Video Tutorial Tambahan",
                    description: "Video tutorial dari expert Java"
                }
            ]
        },
        python: {
            title: "Python & Django",
            description: "Python adalah bahasa pemrograman yang populer untuk data science, machine learning, web development, dan automation. Django adalah framework Python yang powerful untuk pengembangan web. Dalam kursus ini, Anda akan mempelajari dasar-dasar Python dan pengembangan web dengan Django.",
            duration: "28 Jam",
            modules: "22 Modul",
            level: "Menengah",
            videoId: "B1s8KL9dv4E",
            modulesList: [
                {
                    number: 1,
                    title: "Pengenalan Python",
                    duration: "60 menit",
                    description: "Memahami sejarah Python, fitur-fitur utama Python, dan instalasi."
                },
                {
                    number: 2,
                    title: "Syntax Dasar Python",
                    duration: "75 menit",
                    description: "Mempelajari syntax dasar Python, tipe data, dan variabel."
                },
                {
                    number: 3,
                    title: "Control Flow",
                    duration: "60 menit",
                    description: "Menggunakan if-elif-else, for, dan while."
                },
                {
                    number: 4,
                    title: "Functions",
                    duration: "75 menit",
                    description: "Membuat dan menggunakan functions."
                },
                {
                    number: 5,
                    title: "Modules dan Packages",
                    duration: "60 menit",
                    description: "Mengorganisir kode dengan modules dan packages."
                },
                {
                    number: 6,
                    title: "File I/O",
                    duration: "60 menit",
                    description: "Membaca dan menulis file dengan Python."
                },
                {
                    number: 7,
                    title: "Exception Handling",
                    duration: "45 menit",
                    description: "Menangani error dengan try-except-finally."
                },
                {
                    number: 8,
                    title: "OOP - Classes dan Objects",
                    duration: "90 menit",
                    description: "Membuat classes dan objects di Python."
                },
                {
                    number: 9,
                    title: "OOP - Inheritance",
                    duration: "75 menit",
                    description: "Menggunakan inheritance untuk code reuse."
                },
                {
                    number: 10,
                    title: "OOP - Polymorphism",
                    duration: "60 menit",
                    description: "Memahami konsep polymorphism."
                },
                {
                    number: 11,
                    title: "Data Structures - List",
                    duration: "60 menit",
                    description: "Menggunakan list untuk menyimpan koleksi data."
                },
                {
                    number: 12,
                    title: "Data Structures - Tuple",
                    duration: "45 menit",
                    description: "Menggunakan tuple untuk data yang tidak dapat diubah."
                },
                {
                    number: 13,
                    title: "Data Structures - Dictionary",
                    duration: "60 menit",
                    description: "Menggunakan dictionary untuk key-value pairs."
                },
                {
                    number: 14,
                    title: "Pengenalan Django",
                    duration: "60 menit",
                    description: "Memahami konsep MVC dan arsitektur Django."
                },
                {
                    number: 15,
                    title: "Setup Django Project",
                    duration: "75 menit",
                    description: "Membuat dan mengkonfigurasi project Django."
                },
                {
                    number: 16,
                    title: "Django Models",
                    duration: "90 menit",
                    description: "Membuat models untuk database."
                },
                {
                    number: 17,
                    title: "Django Views",
                    duration: "75 menit",
                    description: "Membuat views untuk menangani request."
                },
                {
                    number: 18,
                    title: "Django Templates",
                    duration: "60 menit",
                    description: "Membuat templates untuk rendering HTML."
                },
                {
                    number: 19,
                    title: "Django Forms",
                    duration: "75 menit",
                    description: "Membuat forms untuk input data."
                },
                {
                    number: 20,
                    title: "Django Admin",
                    duration: "60 menit",
                    description: "Menggunakan Django admin untuk manage data."
                },
                {
                    number: 21,
                    title: "Proyek Akhir",
                    duration: "120 menit",
                    description: "Membangun web application dengan Django."
                }
            ],
            resources: [
                {
                    icon: "fas fa-book",
                    title: "Dokumentasi Python",
                    description: "Dokumentasi resmi dari Python.org"
                },
                {
                    icon: "fas fa-book",
                    title: "Dokumentasi Django",
                    description: "Dokumentasi resmi dari Django Project"
                },
                {
                    icon: "fas fa-code",
                    title: "Python Cheatsheet",
                    description: "Cheat sheet untuk syntax Python"
                },
                {
                    icon: "fas fa-download",
                    title: "Python Packages",
                    description: "Koleksi Python packages populer"
                }
            ]
        }
    };
    
    // Show materi modal function
    function showMateriModal(materiKey) {
        const materi = materiData[materiKey];
        if (!materi) return;
        
        // Set modal content
        materiModalTitle.textContent = materi.title;
        materiDescription.textContent = materi.description;
        materiDuration.textContent = materi.duration;
        materiModules.textContent = materi.modules;
        materiLevel.textContent = materi.level;
        
        // Add video
        materiVideoContainer.innerHTML = `
            <div class="video-container">
                <iframe src="https://www.youtube.com/embed/${materi.videoId}" 
                        title="YouTube video player" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                </iframe>
            </div>
        `;
        
        // Load modules
        modulesList.innerHTML = '';
        materi.modulesList.forEach(module => {
            const moduleItem = document.createElement('div');
            moduleItem.className = 'module-item';
            moduleItem.innerHTML = `
                <div class="module-header">
                    <div class="module-number">${module.number}</div>
                    <div class="module-duration">${module.duration}</div>
                </div>
                <h4 class="module-title">${module.title}</h4>
                <p class="module-description">${module.description}</p>
            `;
            modulesList.appendChild(moduleItem);
        });
        
        // Load resources
        resourcesList.innerHTML = '';
        materi.resources.forEach(resource => {
            const resourceItem = document.createElement('div');
            resourceItem.className = 'resource-item';
            resourceItem.innerHTML = `
                <div class="resource-icon">
                    <i class="${resource.icon}"></i>
                </div>
                <div class="resource-info">
                    <h4>${resource.title}</h4>
                    <p>${resource.description}</p>
                </div>
            `;
            resourcesList.appendChild(resourceItem);
        });
        
        // Show modal
        materiModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Track course progress
        trackCourseProgress(materiKey);
    }
    
    // Hide materi modal function
    function hideMateriModal() {
        materiModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Handle tab clicks in materi modal
    document.querySelectorAll('.materi-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and panes
            document.querySelectorAll('.materi-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Show corresponding pane
            const tabId = tab.getAttribute('data-tab');
            const tabPane = document.getElementById(tabId);
            if (tabPane) {
                tabPane.classList.add('active');
            }
        });
    });
    
    // Close modal when clicking close button or overlay
    if (closeMateriModal) {
        closeMateriModal.addEventListener('click', hideMateriModal);
    }
    if (materiModalOverlay) {
        materiModalOverlay.addEventListener('click', hideMateriModal);
    }
    
    // Track course progress
    function trackCourseProgress(materiKey) {
        if (window.auth && window.doc && window.updateDoc && window.serverTimestamp && window.db) {
            const user = window.auth.currentUser;
            if (!user) return;
            
            // Get current user data
            window.getDoc(window.doc(window.db, 'users', user.uid))
                .then((doc) => {
                    if (doc.exists()) {
                        const userData = doc.data();
                        const coursesCompleted = userData.coursesCompleted || [];
                        
                        // Check if course is already completed
                        if (!coursesCompleted.includes(materiKey)) {
                            // For demo purposes, we'll mark the course as completed after viewing
                            // In a real app, you would track actual progress
                            setTimeout(() => {
                                // Add course to completed list
                                coursesCompleted.push(materiKey);
                                
                                // Update user document
                                return window.updateDoc(window.doc(window.db, 'users', user.uid), {
                                    coursesCompleted: coursesCompleted,
                                    studyHours: (userData.studyHours || 0) + 1 // Add 1 hour for demo
                                });
                            }, 5000); // After 5 seconds of viewing
                        }
                    }
                })
                .catch((error) => {
                    console.log("Error getting document:", error);
                });
        }
    }
    
    // Save quiz score to Firestore
    function saveQuizScore(score) {
        if (window.auth && window.doc && window.setDoc && window.serverTimestamp && window.db) {
            const user = window.auth.currentUser;
            if (!user) return;
            
            // Get current date
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            
            // Create avatar from username initials
            const names = user.displayName ? user.displayName.split(' ') : [user.email.substring(0, 2).toUpperCase()];
            const initials = names.map(name => name[0]).join('').toUpperCase().substring(0, 2);
            
            // Get current user data
            window.getDoc(window.doc(window.db, 'users', user.uid))
                .then((doc) => {
                    if (doc.exists()) {
                        const userData = doc.data();
                        const quizScores = userData.quizScores || [];
                        
                        // Add new quiz score
                        quizScores.push({
                            score: score,
                            date: formattedDate,
                            totalQuestions: 10
                        });
                        
                        // Update user document
                        return window.updateDoc(window.doc(window.db, 'users', user.uid), {
                            quizScores: quizScores
                        });
                    } else {
                        // User document doesn't exist, create it
                        const names = user.displayName ? user.displayName.split(' ') : ['', ''];
                        return window.setDoc(window.doc(window.db, 'users', user.uid), {
                            firstName: names[0] || '',
                            lastName: names.slice(1).join(' ') || '',
                            email: user.email,
                            displayName: user.displayName,
                            photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/150/150.jpg`,
                            createdAt: window.serverTimestamp(),
                            lastLogin: window.serverTimestamp(),
                            coursesCompleted: [],
                            quizScores: [{
                                score: score,
                                date: formattedDate,
                                totalQuestions: 10
                            }],
                            studyHours: 0
                        });
                    }
                })
                .then(() => {
                    // Update profile stats if profile modal is open
                    if (document.getElementById('profileQuizScore')) {
                        document.getElementById('profileQuizScore').textContent = score;
                    }
                })
                .catch((error) => {
                    console.log("Error saving quiz score:", error);
                });
        }
    }
    
    // Show notification function
    function showNotification(message, type = 'info') {
        // Remove any existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Set icon based on type
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        else if (type === 'error') icon = 'fa-exclamation-circle';
        else if (type === 'warning') icon = 'fa-exclamation-triangle';
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide notification after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            
            // Remove from DOM after animation
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }
    
    // Remove messages function
    function removeMessages() {
        const messages = document.querySelectorAll('.error-message, .success-message');
        messages.forEach(message => message.remove());
    }
    
    // Get user initials
    function getUserInitials(name) {
        if (!name) return '';
        
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return parts[0][0] + parts[1][0];
        } else {
            return parts[0].substring(0, 2);
        }
    }
    
    // Handle navigation clicks for locked sections
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            
            // If trying to access materi-pemrograman and not logged in
            if (targetId === 'materi-pemrograman' && (!window.auth || !window.auth.currentUser)) {
                e.preventDefault();
                showAuthModal('login', 'materi-pemrograman');
            }
        });
    });
    
    // Handle window resize events
    window.addEventListener('resize', () => {
        // Close mobile menu on desktop
        if (window.innerWidth > 768) {
            navLinks.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        }
    });
    
    // Add loading animation for images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.animation = 'fadeIn 0.5s ease';
        });
    });
    
    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const elementsToAnimate = document.querySelectorAll('.materi-card, .team-member, .game-step');
    elementsToAnimate.forEach(el => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Touch-friendly swipe gestures for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        // Swipe right to open menu
        if (touchEndX - touchStartX > 50 && touchStartX < 50) {
            navLinks.classList.add('active');
            mobileMenuOverlay.classList.add('active');
            mobileMenuBtn.classList.add('active');
        }
        // Swipe left to close menu
        else if (touchStartX - touchEndX > 50) {
            navLinks.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        }
    }
    
    // Improved accessibility for keyboard navigation
    document.addEventListener('keydown', (e) => {
        // ESC key to close modals
        if (e.key === 'Escape') {
            hideAuthModal();
            hideMateriModal();
            hideProfileModal();
            hideVerificationModal();
            
            // Close mobile menu if open
            navLinks.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        }
    });
});
