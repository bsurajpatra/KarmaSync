import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import emailjs from "@emailjs/browser";
import { useAuth } from '../context/AuthContext';
import "react-toastify/dist/ReactToastify.css";

const Contact = () => {
    const { user } = useAuth();
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!message) {
            return toast.error("Please enter your message");
        }

        setLoading(true);

        emailjs
            .send(
                process.env.REACT_APP_EMAILJS_SERVICE_ID,
                process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
                {
                    from_name: user.name,
                    from_email: user.email,
                    message: message
                },
                process.env.REACT_APP_EMAILJS_PUBLIC_API
            )
            .then(
                (result) => {
                    setLoading(false);
                    setMessage("");
                    toast.success("Message sent successfully!");
                },
                (error) => {
                    setLoading(false);
                    console.error(error);
                    toast.error("Failed to send message. Please try again.");
                }
            );
    };

    return (
        <div className="contact-section">
            <div className="contact-container">
                <div className="contact-info">
                <h3>Get in Touch</h3>
<p>Whether it's feedback, support, feature ideas, or collaboration — we’re here for every sprint. Let's keep building better, together.</p>

                    
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
            </div>
            <ToastContainer position="bottom-right" theme="light" />
        </div>
    );
};

export default Contact; 