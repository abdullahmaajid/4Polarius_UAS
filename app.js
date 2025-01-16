const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');

// Load environment variables from .env file
dotenv.config();

// Import routes
const homeRoutes = require('./routes/home');
const authRoutes = require('./routes/auth');
const homeAdminRoutes = require('./routes/homeadmin');
const gajiRoutes = require('./routes/gaji'); // Import route gaji
const jadwalRoutes = require('./routes/jadwal'); // Import route jadwal
const todoRoutes = require('./routes/todo'); // Import route todo
const reportRoutes = require('./routes/report'); // Import route report

const app = express();
const port = process.env.PORT || 3000;

// Middleware untuk parsing data form
app.use(express.urlencoded({ extended: true })); // Parsing application/x-www-form-urlencoded
app.use(express.json()); // Parsing application/json

// Set EJS sebagai view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware untuk file statis (membuat folder 'public' dapat diakses)
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
    secret: 'rahasia', // Ganti dengan secret key yang aman
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set true jika menggunakan HTTPS
}));

// Middleware untuk memeriksa apakah user sudah login
function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/auth/login'); // Redirect ke halaman login jika belum login
}

// Middleware untuk memeriksa apakah user adalah admin
function ensureAdmin(req, res, next) {
    if (req.session.user && req.session.user.isAdmin) {
        return next();
    }
    res.status(403).send('Akses ditolak. Hanya admin yang boleh mengakses halaman ini.');
}

// Routing utama
app.use('/', homeRoutes); // Route untuk halaman utama (home user)
app.use('/auth', authRoutes); // Route untuk autentikasi (login/signup)
app.use('/homeadmin', ensureAuthenticated, ensureAdmin, homeAdminRoutes); // Route untuk home admin (hanya admin)
app.use('/gaji', ensureAuthenticated, ensureAdmin, gajiRoutes); // Route untuk gaji (hanya admin)
app.use('/jadwal', ensureAuthenticated, ensureAdmin, jadwalRoutes); // Route untuk jadwal (hanya admin)
app.use('/todo', ensureAuthenticated, ensureAdmin, todoRoutes); // Route untuk todo (hanya admin)
app.use('/report', ensureAuthenticated, ensureAdmin, reportRoutes); // Route untuk report (hanya admin)

// 404 handler
app.use((req, res, next) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

// 500 handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('500', { title: 'Internal Server Error' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});