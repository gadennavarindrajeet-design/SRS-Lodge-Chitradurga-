// Data Management
let guests = JSON.parse(localStorage.getItem('lodgeease_guests')) || [];
let history = JSON.parse(localStorage.getItem('lodgeease_history')) || [];

// DOM Elements
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-menu li');
const checkinForm = document.getElementById('checkin-form');
const checkoutList = document.getElementById('checkout-list');
const historyTable = document.querySelector('#history-table tbody');
const activeTable = document.querySelector('#active-table tbody');
const modal = document.getElementById('receipt-modal');
const receiptBody = document.getElementById('receipt-body');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    renderCheckout();
    renderHistory();
    document.getElementById('date-display').innerText = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
});

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const target = link.getAttribute('data-page');
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        pages.forEach(p => {
            p.classList.remove('active');
            if (p.id === target) p.classList.add('active');
        });
        if (target === 'dashboard') updateDashboard();
        if (target === 'checkout') renderCheckout();
        if (target === 'history') renderHistory();
    });
});

// Check-In
checkinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const guest = {
        id: Date.now(),
        name: document.getElementById('in-name').value,
        phone: document.getElementById('in-phone').value,
        aadhaar: document.getElementById('in-aadhaar').value,
        address: document.getElementById('in-address').value,
        room: document.getElementById('in-room').value,
        price: parseFloat(document.getElementById('in-price').value),
        paid: parseFloat(document.getElementById('in-paid').value),
        checkin: new Date().toISOString(),
        status: 'active'
    };
    guests.push(guest);
    save();
    checkinForm.reset();
    alert('Check-In Successful!');
    document.querySelector('[data-page="dashboard"]').click();
});

// Check-Out
function renderCheckout() {
    checkoutList.innerHTML = '';
    guests.forEach(g => {
        const card = document.createElement('div');
        card.className = 'guest-card';
        card.innerHTML = `
            <h3>Room ${g.room}</h3>
            <p><strong>Guest:</strong> ${g.name}</p>
            <p><strong>Check-In:</strong> ${new Date(g.checkin).toLocaleString()}</p>
            <button class="btn-checkout" onclick="processCheckout(${g.id})">Process Check-Out</button>
        `;
        checkoutList.appendChild(card);
    });
}

function processCheckout(id) {
    const guest = guests.find(g => g.id === id);
    const checkoutDate = new Date();
    const checkinDate = new Date(guest.checkin);
    const diff = Math.abs(checkoutDate - checkinDate);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;
    const total = days * guest.price;
    const balance = total - guest.paid;

    if (confirm(`Guest: ${guest.name}\nStay: ${days} Day(s)\nTotal: ₹${total}\nPaid: ₹${guest.paid}\nBalance: ₹${balance}\n\nConfirm Check-Out?`)) {
        const record = { ...guest, checkout: checkoutDate.toISOString(), days, total, status: 'completed' };
        history.push(record);
        guests = guests.filter(g => g.id !== id);
        save();
        showReceipt(record);
        renderCheckout();
    }
}

// Dashboard
function updateDashboard() {
    const today = new Date().toDateString();
    const todayIncome = history.filter(h => new Date(h.checkout).toDateString() === today)
                               .reduce((sum, h) => sum + h.total, 0);
    const todayGuests = guests.filter(g => new Date(g.checkin).toDateString() === today).length + 
                        history.filter(h => new Date(h.checkin).toDateString() === today).length;

    document.getElementById('stat-customers').innerText = todayGuests;
    document.getElementById('stat-occupied').innerText = guests.length;
    document.getElementById('stat-income').innerText = `₹${todayIncome}`;

    activeTable.innerHTML = '';
    guests.slice(-5).reverse().forEach(g => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${g.room}</td><td>${g.name}</td><td>${g.phone}</td><td>${new Date(g.checkin).toLocaleTimeString()}</td>`;
        activeTable.appendChild(tr);
    });
}

// History
function renderHistory() {
    historyTable.innerHTML = '';
    history.slice().reverse().forEach(h => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(h.checkout).toLocaleDateString()}</td>
            <td>${h.name}</td>
            <td>${h.room}</td>
            <td>${h.days} Days</td>
            <td>₹${h.total}</td>
            <td><button onclick='viewReceipt(${h.id})' class="btn-small"><i class="fas fa-file-invoice"></i></button></td>
        `;
        historyTable.appendChild(tr);
    });
}

// Receipt
function showReceipt(record) {
    receiptBody.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #2563eb;">LodgeEase Receipt</h2>
            <p>Official Payment Receipt</p>
        </div>
        <hr style="border: 0; border-top: 1px dashed #ccc; margin: 15px 0;">
        <p><strong>Guest:</strong> ${record.name}</p>
        <p><strong>Room:</strong> ${record.room}</p>
        <p><strong>Check-In:</strong> ${new Date(record.checkin).toLocaleString()}</p>
        <p><strong>Check-Out:</strong> ${new Date(record.checkout).toLocaleString()}</p>
        <p><strong>Stay:</strong> ${record.days} Day(s)</p>
        <hr style="border: 0; border-top: 1px dashed #ccc; margin: 15px 0;">
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.2rem;">
            <span>Total Bill:</span>
            <span>₹${record.total}</span>
        </div>
        <p style="text-align: center; margin-top: 30px; font-size: 0.8rem; color: #666;">Thank you for staying with us!</p>
    `;
    modal.style.display = 'block';
    document.getElementById('download-pdf').onclick = () => downloadPDF(record);
}

function viewReceipt(id) {
    showReceipt(history.find(h => h.id === id));
}

function downloadPDF(record) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text("LodgeEase Receipt", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Receipt ID: ${record.id}`, 20, 40);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 40);
    doc.line(20, 45, 190, 45);
    doc.text(`Guest Name: ${record.name}`, 20, 60);
    doc.text(`Phone: ${record.phone}`, 20, 70);
    doc.text(`Room Number: ${record.room}`, 20, 80);
    doc.text(`Check-In: ${new Date(record.checkin).toLocaleString()}`, 20, 90);
    doc.text(`Check-Out: ${new Date(record.checkout).toLocaleString()}`, 20, 100);
    doc.text(`Total Stay: ${record.days} Day(s)`, 20, 110);
    doc.line(20, 120, 190, 120);
    doc.setFontSize(16);
    doc.text(`Total Amount: Rs. ${record.total}`, 20, 135);
    doc.setFontSize(10);
    doc.text("This is a computer generated receipt.", 105, 160, { align: "center" });
    doc.save(`Receipt_${record.name}_${record.room}.pdf`);
}

document.querySelector('.close').onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

function save() {
    localStorage.setItem('lodgeease_guests', JSON.stringify(guests));
    localStorage.setItem('lodgeease_history', JSON.stringify(history));
}
