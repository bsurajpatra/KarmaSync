import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOTP, resendOTP } from '../api/authApi';
import LoadingAnimation from './LoadingAnimation';
import Footer from './Footer';

const OTPVerification = () => {
  console.log('OTPVerification component rendered');
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state?.userData;

  console.log('Location state:', location.state);
  console.log('User data received:', userData);

  useEffect(() => {
    console.log('Checking user data in useEffect');
    if (!userData) {
      console.log('No user data found, redirecting to signup');
      navigate('/signup');
      return;
    }
    console.log('User data is valid:', userData);
  }, [userData, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0 && resendDisabled) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, resendDisabled]);

  const handleChange = (element, index) => {
    console.log('OTP input changed:', { index, value: element.value });
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Move to next input if current field is filled
    if (element.value && index < 5) {
      const nextInput = element.parentElement.nextElementSibling?.querySelector('input');
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace
      const prevInput = e.target.parentElement.previousElementSibling?.querySelector('input');
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('OTP form submitted');
    setError('');
    setLoading(true);

    const otpString = otp.join('');
    console.log('OTP string:', otpString);
    
    if (otpString.length !== 6) {
      console.log('Invalid OTP length');
      setError('Please enter all digits of the OTP');
      setLoading(false);
      return;
    }

    try {
      console.log('Verifying OTP...');
      const response = await verifyOTP({
        email: userData.email,
        otp: otpString
      });
      console.log('OTP verification response:', response);

      setSuccess(true);
      console.log('Setting success state to true');

      setTimeout(() => {
        console.log('Navigating to login page');
        navigate('/login', {
          state: {
            message: 'Account verified successfully! Please login with your credentials.'
          }
        });
      }, 2000);
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    console.log('Resending OTP');
    setError('');
    setResendDisabled(true);
    setCountdown(30);

    try {
      console.log('Making resend OTP request...');
      const response = await resendOTP({ email: userData.email });
      console.log('Resend OTP response:', response);
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError('Failed to resend OTP. Please try again.');
      setResendDisabled(false);
      setCountdown(0);
    }
  };

  if (loading) {
    return <LoadingAnimation message="Verifying your email..." />;
  }

  return (
    <div className="auth-container">
      <div className="auth-logo-section">
        <img src="/logo.png" alt="KarmaSync Logo" className="auth-logo" />
        <div className="auth-logo-text">KarmaSync</div>
      </div>
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Verify Your Email</h2>
            <p className="auth-subtitle">Enter the 6-digit code sent to {userData?.email}</p>
            <p className="auth-subtitle" style={{ fontSize: '0.9em' }}>
              Please check your spam folder if you don't see the email in your inbox
            </p>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && (
            <div className="auth-success">
              Email verified successfully! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form otp-form">
            <div className="otp-inputs" style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '1.5rem'
            }}>
              {otp.map((digit, index) => (
                <div key={index} className="otp-input-group" style={{
                  display: 'inline-block'
                }}>
                  <input
                    type="text"
                    maxLength="1"
                    className="auth-input otp-input"
                    value={digit}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    autoFocus={index === 0}
                    style={{
                      width: '45px',
                      height: '45px',
                      textAlign: 'center',
                      padding: '0',
                      fontSize: '1.2rem',
                      margin: '0'
                    }}
                  />
                </div>
              ))}
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={loading || success}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            <div className="resend-otp" style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                className="auth-link"
                onClick={handleResendOTP}
                disabled={resendDisabled}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: resendDisabled ? 'not-allowed' : 'pointer',
                  opacity: resendDisabled ? 0.7 : 1,
                  textDecoration: 'none',
                  marginRight: '0'
                }}
              >
                {resendDisabled 
                  ? `Resend OTP in ${countdown}s`
                  : 'Resend OTP'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OTPVerification; 