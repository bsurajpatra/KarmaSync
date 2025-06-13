import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import emailjs from "@emailjs/browser";
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from '../api/authApi';
import { Link } from 'react-router-dom';
import "react-toastify/dist/ReactToastify.css";

const Contact = () => {
    const { user } = useAuth();
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await getCurrentUser();
                setUserDetails(response.data);
                console.log("User details fetched:", response.data);
            } catch (error) {
                console.error("Error fetching user details:", error);
                toast.error("Failed to load user details");
            }
        };
        fetchUserDetails();
    }, []);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!message) {
            return toast.error("Please enter your message");
        }

        setLoading(true);
        console.log("Starting email send process...");
        console.log("Environment variables:", {
            serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID,
            templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
            publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_API
        });
        console.log("User details being used:", {
            fullName: userDetails?.fullName || user?.fullName,
            email: userDetails?.email || user?.email
        });

        try {
            const templateParams = {
                from_name: userDetails?.fullName || user?.fullName,
                from_email: userDetails?.email || user?.email,
                message: message
            };
            console.log("Sending email with params:", templateParams);

            const result = await emailjs.send(
                process.env.REACT_APP_EMAILJS_SERVICE_ID,
                process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
                templateParams,
                process.env.REACT_APP_EMAILJS_PUBLIC_API
            );
            
            console.log("Email sent successfully:", result);
            setLoading(false);
            setMessage("");
            setShowSuccessMessage(true);
            toast.success("Message sent successfully!");
        } catch (error) {
            setLoading(false);
            console.error("Detailed error in email sending:", {
                error: error,
                message: error.message,
                text: error.text,
                status: error.status
            });
            toast.error("Failed to send message. Please try again.");
        }
    };

    return (
        <div className="contact-wrapper">
            <div className="contact-header">
                <div className="contact-header-content">
                    <div className="contact-header-left">
                        <h1>Contact Us</h1>
                        <p className="contact-subtitle">Get in touch with our support team</p>
                    </div>
                    <Link to="/dashboard" className="back-to-dashboard-button">
                        <i className="fas fa-arrow-left"></i> Back to Dashboard
                    </Link>
                </div>
            </div>

            <div className="contact-section">
                <div className="contact-container">
                    <div className="contact-info">
                        <h3>Get in Touch</h3>
                        <p>Whether it's feedback, support, feature ideas, or collaboration — we're here for every sprint. Let's keep building better, together.</p>
                        
                        <div className="contact-details">
                            <div className="contact-item">
                                <i className="fas fa-envelope"></i>
                                <span>Mail : karmasync.official@gmail.com</span>
                            </div>
                            <div className="contact-item">
                                <i className="fas fa-phone"></i>
                                <span>Phone : +91 876 3232 589</span>
                            </div>
                        </div>
                    </div>

                    {showSuccessMessage ? (
                        <div className="success-message">
                            <i className="fas fa-check-circle"></i>
                            <h4>Message Sent Successfully!</h4>
                            <p>Thank you for reaching out. You can expect a reply from our team at your registered email address ({userDetails?.email || user?.email}) within 24-48 hours.</p>
                            <p className="spam-notice">
                                <i className="fas fa-info-circle"></i>
                                Please check your spam folder if you don't receive our response in your inbox.
                            </p>
                            <button 
                                className="btn btn-primary"
                                onClick={() => setShowSuccessMessage(false)}
                            >
                                Send Another Message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={submitHandler} className="contact-form">
                            <div className="form-group">
                                <label>Message</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="form-control"
                                    rows="5"
                                    placeholder="Write your message here..."
                                    required
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> Sending...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-paper-plane"></i> Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
            <ToastContainer position="bottom-right" theme="light" />
        </div>
    );
};

export default Contact; 