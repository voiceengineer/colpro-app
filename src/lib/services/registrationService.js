// import * as SecureStore from 'expo-secure-store';

// const API_URL = "https://dev.collpro.uz/api";
// const TOKEN_KEY = "auth_token";
// const USER_KEY = "user_data";

// export const registrationService = {
//   async registerFieldAgent(registrationData) {
//     try {
//       const {
//         name,
//         phoneNumber,
//         password,
//         confirmPassword,
//         pinfl,
//         passportNumber,
//         passportIssueDate,
//         passportIssuePlace,
//         employeeAddress,
//       } = registrationData;

//       // Validate required fields
//       if (!name || !phoneNumber || !password || !confirmPassword) {
//         throw new Error("Please fill all required fields");
//       }

//       // Validate password match
//       if (password !== confirmPassword) {
//         throw new Error("Passwords do not match");
//       }

//       // Validate password strength
//       if (password.length < 8) {
//         throw new Error("Password must be at least 8 characters long");
//       }

//       // Validate PINFL (must be 14 digits)
//       if (!pinfl || pinfl.trim().length !== 14) {
//         throw new Error("PINFL must be exactly 14 digits");
//       }

//       // Validate passport number
//       if (!passportNumber || passportNumber.trim().length === 0) {
//         throw new Error("Passport number is required");
//       }

//       // Validate passport issue date
//       if (!passportIssueDate) {
//         throw new Error("Passport issue date is required");
//       }

//       // Validate passport issue place
//       if (!passportIssuePlace || passportIssuePlace.trim().length === 0) {
//         throw new Error("Passport issue place is required");
//       }

//       // Validate employee address
//       if (!employeeAddress || employeeAddress.trim().length === 0) {
//         throw new Error("Employee address is required");
//       }

//       // Format phone number (ensure it starts with +998)
//       let formattedPhone = phoneNumber.trim();
//       if (!formattedPhone.startsWith('+')) {
//         if (formattedPhone.startsWith('998')) {
//           formattedPhone = '+' + formattedPhone;
//         } else {
//           formattedPhone = '+998' + formattedPhone;
//         }
//       }

//       console.log('Sending registration request to:', `${API_URL}/register-field-agent`);
//       console.log('Request data:', {
//         name: name.trim(),
//         phoneNumber: formattedPhone,
//         pinfl: pinfl.trim(),
//         passportNumber: passportNumber.trim(),
//         passportIssueDate: passportIssueDate,
//         passportIssuePlace: passportIssuePlace.trim(),
//         employeeAddress: employeeAddress.trim(),
//       });

//       const response = await fetch(`${API_URL}/register-field-agent`, {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json",
//           "Accept": "application/json"
//         },
//         body: JSON.stringify({
//           name: name.trim(),
//           phoneNumber: formattedPhone,
//           password,
//           confirmPassword,
//           pinfl: pinfl.trim(),
//           passportNumber: passportNumber.trim(),
//           passportIssueDate: passportIssueDate,
//           passportIssuePlace: passportIssuePlace.trim(),
//           employeeAddress: employeeAddress.trim(),
//         }),
//       });

//       console.log('Response status:', response.status);
      
//       const data = await response.json();
//       console.log('Response data:', data);

//       if (!response.ok) {
//         throw new Error(data.message || `Registration failed with status ${response.status}`);
//       }

//       return {
//         success: true,
//         user: data,
//         message: "Registration successful!",
//       };
//     } catch (error) {
//       console.error('Registration error:', error);
//       throw error;
//     }
//   },

//   async autoLoginAfterRegistration(phoneNumber, password) {
//     try {
//       // Format phone number
//       let formattedPhone = phoneNumber.trim();
//       if (!formattedPhone.startsWith('+')) {
//         if (formattedPhone.startsWith('998')) {
//           formattedPhone = '+' + formattedPhone;
//         } else {
//           formattedPhone = '+998' + formattedPhone;
//         }
//       }

//       console.log('Attempting auto-login with:', formattedPhone);

//       const response = await fetch(`${API_URL}/login`, {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json",
//           "Accept": "application/json"
//         },
//         body: JSON.stringify({ 
//           username: formattedPhone, 
//           password 
//         }),
//       });

//       console.log('Login response status:', response.status);

//       const data = await response.json();
//       console.log('Login response data:', data);

//       if (!response.ok) {
//         throw new Error(data.message || "Login failed");
//       }

//       const token = data.access_token;
//       const user = data.user;

//       if (!token) {
//         throw new Error("Token missing in response");
//       }

//       await SecureStore.setItemAsync(TOKEN_KEY, token);
//       if (user) {
//         await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
//       }

//       return { token, user };
//     } catch (error) {
//       console.error('Auto-login error:', error);
//       throw error;
//     }
//   },
// };