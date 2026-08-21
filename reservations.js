/* ===== Rustic Apron — Reservations Page Script ===== */

/* Footer Year */

document.getElementById('year').textContent = new Date().getFullYear();


/* Navbar Scroll */

const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {

  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

});


/* Mobile Menu */

const ham = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

ham.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-menu a').forEach(link => {

  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });

});


/* ===== Settings ===== */

const OPEN_HOUR = 11;          /* 11:00 AM */
const CLOSE_HOUR = 22;         /* 10:00 PM */
const LAST_SEATING_HOUR = 21;  /* last table goes out at 9:00 PM */
const SLOT_MINUTES = 30;
const MAX_DAYS_AHEAD = 90;
const MAX_REQUESTS = 300;

const form = document.getElementById('reservationForm');
const confirmation = document.getElementById('confirmation');

const dateInput = document.getElementById('date');
const timeInput = document.getElementById('time');
const guestsInput = document.getElementById('guests');
const requestsInput = document.getElementById('requests');
const slotGrid = document.getElementById('slotGrid');
const charCount = document.getElementById('charCount');


/* ===== Date Helpers ===== */

/* A yyyy-mm-dd string for a Date, in local time (not UTC). */

function toDateValue(date) {

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return date.getFullYear() + '-' + month + '-' + day;

}


/* Parses yyyy-mm-dd as a local date so timezones cannot shift the day. */

function parseDateValue(value) {

  const parts = value.split('-');

  return new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
  );

}


function formatTime(hour, minute) {

  const suffix = hour < 12 ? 'AM' : 'PM';
  const display = hour % 12 === 0 ? 12 : hour % 12;

  return display + ':' + String(minute).padStart(2, '0') + ' ' + suffix;

}


function formatDate(value) {

  return parseDateValue(value).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

}


/* Limit the picker to today .. 90 days out. */

const today = new Date();

const maxDate = new Date();
maxDate.setDate(maxDate.getDate() + MAX_DAYS_AHEAD);

dateInput.min = toDateValue(today);
dateInput.max = toDateValue(maxDate);


/* ===== Time Slots ===== */

/*
  Stands in for a real availability lookup: the same date and time
  always produce the same answer, so slots do not jump around while
  the guest is filling the form in.
*/

function isSlotBooked(dateValue, minutes) {

  let hash = 0;

  const key = dateValue + ':' + minutes;

  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) % 997;
  }

  return hash % 5 === 0;

}


function buildSlots(dateValue) {

  slotGrid.innerHTML = '';

  timeInput.value = '';
  updateSummary();

  if (!dateValue) {

    slotGrid.innerHTML =
      '<p class="slot-placeholder">Choose a date to see available times.</p>';

    return;

  }

  const now = new Date();
  const isToday = dateValue === toDateValue(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  let openSlots = 0;

  for (
    let minutes = OPEN_HOUR * 60;
    minutes <= LAST_SEATING_HOUR * 60;
    minutes += SLOT_MINUTES
  ) {

    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    const label = formatTime(hour, minute);

    const slot = document.createElement('button');

    slot.type = 'button';
    slot.className = 'slot';
    slot.textContent = label;
    slot.dataset.time = label;

    /* Today's slots need at least an hour of notice. */

    const tooLate = isToday && minutes < nowMinutes + 60;
    const booked = isSlotBooked(dateValue, minutes);

    if (tooLate || booked) {

      slot.disabled = true;
      slot.title = tooLate ? 'No longer available today' : 'Fully booked';

    } else {

      openSlots++;

      slot.addEventListener('click', () => selectSlot(slot));

    }

    slotGrid.appendChild(slot);

  }

  if (openSlots === 0) {

    slotGrid.innerHTML =
      '<p class="slot-placeholder">' +
      'No tables left on this date — please try another day.' +
      '</p>';

  }

}


function selectSlot(slot) {

  slotGrid.querySelectorAll('.slot').forEach(other => {
    other.classList.remove('selected');
  });

  slot.classList.add('selected');

  timeInput.value = slot.dataset.time;

  validateField(timeInput);
  updateSummary();

}


dateInput.addEventListener('change', () => {

  buildSlots(dateInput.value);
  validateField(dateInput);
  updateSummary();

});


/* ===== Validation Rules ===== */

const namePattern = /^[A-Za-z][A-Za-z '\-]*$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const phonePattern = /^\+?[0-9\s\-()]{7,20}$/;

const rules = {

  firstName(value) {

    if (value === '') {
      return 'Please enter your first name.';
    }

    if (value.length < 2) {
      return 'First name must be at least 2 characters.';
    }

    if (!namePattern.test(value)) {
      return 'First name can only contain letters, spaces, hyphens and apostrophes.';
    }

    return '';

  },

  lastName(value) {

    if (value === '') {
      return 'Please enter your last name.';
    }

    if (value.length < 2) {
      return 'Last name must be at least 2 characters.';
    }

    if (!namePattern.test(value)) {
      return 'Last name can only contain letters, spaces, hyphens and apostrophes.';
    }

    return '';

  },

  email(value) {

    if (value === '') {
      return 'Please enter your email address.';
    }

    if (!emailPattern.test(value)) {
      return 'Please enter a valid email address, e.g. john@example.com';
    }

    return '';

  },

  phone(value) {

    if (value === '') {
      return 'Please enter a phone number so we can reach you about the booking.';
    }

    if (!phonePattern.test(value)) {
      return 'Please enter a valid phone number (7–20 digits).';
    }

    return '';

  },

  date(value) {

    if (value === '') {
      return 'Please choose a date.';
    }

    const chosen = parseDateValue(value);

    if (Number.isNaN(chosen.getTime())) {
      return 'Please choose a valid date.';
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    if (chosen < startOfToday) {
      return 'That date has already passed. Please choose today or later.';
    }

    const latest = new Date();
    latest.setHours(0, 0, 0, 0);
    latest.setDate(latest.getDate() + MAX_DAYS_AHEAD);

    if (chosen > latest) {
      return 'We take bookings up to ' + MAX_DAYS_AHEAD + ' days ahead.';
    }

    return '';

  },

  guests(value) {

    if (value === '') {
      return 'Please tell us how many guests are joining.';
    }

    const guests = Number(value);

    if (guests < 1 || guests > 12) {
      return 'For parties over 12, please call 1234567890.';
    }

    return '';

  },

  time(value) {

    if (value === '') {
      return 'Please pick an available time.';
    }

    return '';

  },

  requests(value) {

    if (value.length > MAX_REQUESTS) {
      return 'Special requests must be ' + MAX_REQUESTS + ' characters or fewer.';
    }

    return '';

  },

  terms(checked) {

    if (!checked) {
      return 'Please accept the booking conditions.';
    }

    return '';

  }

};


function getValue(field) {

  if (field.type === 'checkbox') {
    return field.checked;
  }

  return field.value.trim();

}


function validateField(field) {

  const errorBox = document.getElementById(field.id + 'Error');
  const message = rules[field.id](getValue(field));

  /* The time is chosen through the slot grid, not a visible input. */

  const target = field === timeInput ? slotGrid : field;

  if (message) {

    errorBox.textContent = message;
    errorBox.classList.add('show');

    target.classList.add('invalid');
    target.classList.remove('valid');

    field.setAttribute('aria-invalid', 'true');

    return false;

  }

  errorBox.textContent = '';
  errorBox.classList.remove('show');

  target.classList.remove('invalid');

  const value = getValue(field);

  if (value === '' || value === false) {
    target.classList.remove('valid');
  } else if (field !== timeInput) {
    target.classList.add('valid');
  }

  field.removeAttribute('aria-invalid');

  return true;

}


function clearField(field) {

  const errorBox = document.getElementById(field.id + 'Error');
  const target = field === timeInput ? slotGrid : field;

  errorBox.textContent = '';
  errorBox.classList.remove('show');

  target.classList.remove('invalid', 'valid');
  field.removeAttribute('aria-invalid');

}


const fields = Object.keys(rules).map(id => document.getElementById(id));

fields.forEach(field => {

  if (field === timeInput) {
    return;    /* driven by the slot buttons */
  }

  const eventName = (field.type === 'checkbox' || field.tagName === 'SELECT')
    ? 'change'
    : 'blur';

  field.addEventListener(eventName, () => validateField(field));

  field.addEventListener('input', () => {

    if (field.classList.contains('invalid')) {
      validateField(field);
    }

  });

});


/* Character counter */

requestsInput.addEventListener('input', () => {

  const used = requestsInput.value.trim().length;

  charCount.textContent = used + ' / ' + MAX_REQUESTS;
  charCount.classList.toggle('limit', used > MAX_REQUESTS);

});


/* ===== Live Summary ===== */

function getSeating() {

  const checked = form.querySelector('input[name="seating"]:checked');

  return checked ? checked.value : '—';

}


function updateSummary() {

  const guestCount = guestsInput.value;

  document.getElementById('sumDate').textContent =
    dateInput.value ? formatDate(dateInput.value) : '—';

  document.getElementById('sumTime').textContent =
    timeInput.value || '—';

  document.getElementById('sumGuests').textContent =
    guestCount ? guestCount + (guestCount === '1' ? ' guest' : ' guests') : '—';

  document.getElementById('sumSeating').textContent = getSeating();

  document.getElementById('sumOccasion').textContent =
    document.getElementById('occasion').value || '—';

}


['guests', 'occasion'].forEach(id => {
  document.getElementById(id).addEventListener('change', updateSummary);
});

form.querySelectorAll('input[name="seating"]').forEach(radio => {
  radio.addEventListener('change', updateSummary);
});


/* ===== Submit ===== */

function makeReference() {

  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  let code = '';

  for (let i = 0; i < 6; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  return 'RA-' + code;

}


form.addEventListener('submit', function (e) {

  e.preventDefault();

  let firstInvalid = null;

  fields.forEach(field => {

    const isValid = validateField(field);

    if (!isValid && !firstInvalid) {
      firstInvalid = field;
    }

  });

  if (firstInvalid) {

    const target = firstInvalid === timeInput ? slotGrid : firstInvalid;

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    if (firstInvalid !== timeInput) {
      firstInvalid.focus({ preventScroll: true });
    }

    return;

  }

  showConfirmation();

});


function showConfirmation() {

  const guestCount = guestsInput.value;

  const name =
    document.getElementById('firstName').value.trim() + ' ' +
    document.getElementById('lastName').value.trim();

  document.getElementById('confirmLead').textContent =
    'Thank you, ' + name + '. We look forward to hosting you.';

  document.getElementById('bookingRef').textContent = makeReference();

  const details = [
    ['Date', formatDate(dateInput.value)],
    ['Time', timeInput.value],
    ['Guests', guestCount + (guestCount === '1' ? ' guest' : ' guests')],
    ['Seating', getSeating()],
    ['Occasion', document.getElementById('occasion').value || 'None'],
    ['Email', document.getElementById('email').value.trim()],
    ['Phone', document.getElementById('phone').value.trim()]
  ];

  const requests = requestsInput.value.trim();

  if (requests) {
    details.push(['Requests', requests]);
  }

  const list = document.getElementById('confirmList');

  list.innerHTML = '';

  details.forEach(row => {

    const item = document.createElement('li');

    const label = document.createElement('span');
    label.textContent = row[0];

    const value = document.createElement('strong');
    value.textContent = row[1];

    item.appendChild(label);
    item.appendChild(value);

    list.appendChild(item);

  });

  form.style.display = 'none';
  confirmation.classList.add('show');

  confirmation.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });

}


document.getElementById('newBooking').addEventListener('click', () => {

  form.reset();

  fields.forEach(clearField);

  timeInput.value = '';

  buildSlots('');

  charCount.textContent = '0 / ' + MAX_REQUESTS;
  charCount.classList.remove('limit');

  updateSummary();

  confirmation.classList.remove('show');
  form.style.display = 'block';

  form.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });

});


/* ===== Open / Closed Badge ===== */

function updateOpenStatus() {

  const now = new Date();

  const minutes = now.getHours() * 60 + now.getMinutes();

  const status = document.getElementById('openStatus');

  if (minutes >= OPEN_HOUR * 60 && minutes < CLOSE_HOUR * 60) {
    status.textContent = '● Open now — closes at 10:00 PM';
  } else {
    status.textContent = '● Closed now — opens at 11:00 AM';
  }

}

updateOpenStatus();
updateSummary();
