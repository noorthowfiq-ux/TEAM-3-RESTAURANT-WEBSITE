/* ===== Rustic Apron — Contact Page Script ===== */

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


/* ===== Form Validation ===== */

const form = document.getElementById('contactForm');
const successMsg = document.getElementById('successMsg');

const MAX_MESSAGE = 500;

const namePattern = /^[A-Za-z][A-Za-z '\-]*$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const phonePattern = /^\+?[0-9\s\-()]{7,20}$/;


/*
  Each rule returns an error message string when the value is
  invalid, or an empty string when the field is fine.
*/

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

    /* Optional field — only validated when something was typed. */

    if (value === '') {
      return '';
    }

    if (!phonePattern.test(value)) {
      return 'Please enter a valid phone number (7–20 digits).';
    }

    return '';

  },

  subject(value) {

    if (value === '') {
      return 'Please choose a subject.';
    }

    return '';

  },

  guests(value) {

    /* Optional field. */

    if (value === '') {
      return '';
    }

    const guests = Number(value);

    if (!Number.isInteger(guests)) {
      return 'Please enter a whole number of guests.';
    }

    if (guests < 1 || guests > 30) {
      return 'We can seat between 1 and 30 guests. For larger parties, please call us.';
    }

    return '';

  },

  message(value) {

    if (value === '') {
      return 'Please enter a message.';
    }

    if (value.length < 10) {
      return 'Your message must be at least 10 characters.';
    }

    if (value.length > MAX_MESSAGE) {
      return 'Your message must be ' + MAX_MESSAGE + ' characters or fewer.';
    }

    return '';

  },

  consent(checked) {

    if (!checked) {
      return 'Please tick the box so we can reply to you.';
    }

    return '';

  }

};


/* Reads the value a rule should be given for a field. */

function getValue(field) {

  if (field.type === 'checkbox') {
    return field.checked;
  }

  return field.value.trim();

}


/* Runs one field's rule and paints the result on screen. */

function validateField(field) {

  const errorBox = document.getElementById(field.id + 'Error');
  const message = rules[field.id](getValue(field));

  if (message) {

    errorBox.textContent = message;
    errorBox.classList.add('show');

    field.classList.add('invalid');
    field.classList.remove('valid');

    field.setAttribute('aria-invalid', 'true');

    return false;

  }

  errorBox.textContent = '';
  errorBox.classList.remove('show');

  field.classList.remove('invalid');

  /* Only mark green once the user has actually filled something in. */

  if (getValue(field) === '' || getValue(field) === false) {
    field.classList.remove('valid');
  } else {
    field.classList.add('valid');
  }

  field.removeAttribute('aria-invalid');

  return true;

}


function clearField(field) {

  const errorBox = document.getElementById(field.id + 'Error');

  errorBox.textContent = '';
  errorBox.classList.remove('show');

  field.classList.remove('invalid', 'valid');
  field.removeAttribute('aria-invalid');

}


const fields = Object.keys(rules).map(id => document.getElementById(id));


/*
  Validate on blur so the user is not nagged mid-typing, then
  re-validate live once a field is already showing an error.
*/

fields.forEach(field => {

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


/* Live character counter for the message box. */

const messageInput = document.getElementById('message');
const charCount = document.getElementById('charCount');

messageInput.addEventListener('input', () => {

  const used = messageInput.value.trim().length;

  charCount.textContent = used + ' / ' + MAX_MESSAGE;
  charCount.classList.toggle('limit', used > MAX_MESSAGE);

});


/* Submit */

form.addEventListener('submit', function (e) {

  e.preventDefault();

  successMsg.classList.remove('show');

  let firstInvalid = null;

  fields.forEach(field => {

    const isValid = validateField(field);

    if (!isValid && !firstInvalid) {
      firstInvalid = field;
    }

  });

  if (firstInvalid) {

    firstInvalid.focus();

    firstInvalid.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    return;

  }

  /* All good — in a real backend this is where the data would be posted. */

  successMsg.classList.add('show');

  successMsg.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });

  form.reset();

  fields.forEach(clearField);

  charCount.textContent = '0 / ' + MAX_MESSAGE;
  charCount.classList.remove('limit');

});
